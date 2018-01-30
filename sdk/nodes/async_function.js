const util = require('util'),
  vm = require('vm'),
  _ = require('lodash'),
  Promise = require('bluebird');

module.exports = function (RED) {

  function sendResults (node, _msgid, msgs) {
    if (!msgs)
      return;
    else if (!util.isArray(msgs))
      msgs = [msgs];

    let msgCount = 0;
    for (let m = 0; m < msgs.length; m++)
      if (msgs[m]) {
        if (!util.isArray(msgs[m]))
          msgs[m] = [msgs[m]];

        for (let n = 0; n < msgs[m].length; n++) {
          let msg = msgs[m][n];
          if (msg !== null && msg !== undefined)
            if (typeof msg === 'object' && !Buffer.isBuffer(msg) && !util.isArray(msg)) {
              msg._msgid = _msgid;
              msgCount++;
            } else {
              let type = typeof msg;
              if (type === 'object')
                type = Buffer.isBuffer(msg) ? 'Buffer' : (util.isArray(msg) ? 'Array' : 'Date');

              node.error(RED._('function.error.non-message-returned', {type: type}));
            }

        }
      }

    if (msgCount > 0)
      node.send(msgs);

  }

  function FunctionNode (n) {
    RED.nodes.createNode(this, n);
    let node = this;
    this.name = n.name;
    this.func = n.func;
    let functionText = 'var results = null;' +
      'results = (async function(msg){ ' +
      'var __msgid__ = msg._msgid;' +
      'var node = {' +
      'log:__node__.log,' +
      'error:__node__.error,' +
      'warn:__node__.warn,' +
      'on:__node__.on,' +
      'status:__node__.status,' +
      'send:function(msgs){ __node__.send(__msgid__,msgs);}' +
      '};\n' +
      this.func + '\n' +
      '})(msg);';

    this.topic = n.topic;
    this.outstandingTimers = [];
    this.outstandingIntervals = [];
    let sandbox = {
      Promise: Promise,
      console: console,
      util: util,
      Buffer: Buffer,
      RED: {
        util: RED.util
      },
      __node__: {
        log: function () {
          node.log.apply(node, arguments);
        },
        error: function () {
          node.error.apply(node, arguments);
        },
        warn: function () {
          node.warn.apply(node, arguments);
        },
        send: function (id, msgs) {
          sendResults(node, id, msgs);
        },
        on: function () {
          if (arguments[0] === 'input')
            throw new Error(RED._('function.error.inputListener'));

          node.on.apply(node, arguments);
        },
        status: function () {
          node.status.apply(node, arguments);
        }
      },
      context: {
        set: function () {
          node.context().set.apply(node, arguments);
        },
        get: function () {
          return node.context().get.apply(node, arguments);
        },
        keys: function () {
          return node.context().keys.apply(node, arguments);
        },
        get global () {
          return node.context().global;
        },
        get flow () {
          return node.context().flow;
        }
      },
      flow: {
        set: function () {
          node.context().flow.set.apply(node, arguments);
        },
        get: function () {
          return node.context().flow.get.apply(node, arguments);
        },
        keys: function () {
          return node.context().flow.keys.apply(node, arguments);
        }
      },
      global: {
        set: function () {
          node.context().global.set.apply(node, arguments);
        },
        get: function () {
          return node.context().global.get.apply(node, arguments);
        },
        keys: function () {
          return node.context().global.keys.apply(node, arguments);
        }
      },
      setTimeout: function () {
        var func = arguments[0];
        var timerId;
        arguments[0] = function () {
          sandbox.clearTimeout(timerId);
          try {
            func.apply(this, arguments);
          } catch (err) {
            node.error(err, {});
          }
        };
        timerId = setTimeout.apply(this, arguments);
        node.outstandingTimers.push(timerId);
        return timerId;
      },
      clearTimeout: function (id) {
        clearTimeout(id);
        var index = node.outstandingTimers.indexOf(id);
        if (index > -1)
          node.outstandingTimers.splice(index, 1);

      },
      setInterval: function () {
        var func = arguments[0];
        var timerId;
        arguments[0] = function () {
          try {
            func.apply(this, arguments);
          } catch (err) {
            node.error(err, {});
          }
        };
        timerId = setInterval.apply(this, arguments);
        node.outstandingIntervals.push(timerId);
        return timerId;
      },
      clearInterval: function (id) {
        clearInterval(id);
        var index = node.outstandingIntervals.indexOf(id);
        if (index > -1)
          node.outstandingIntervals.splice(index, 1);

      }
    };
    let context = vm.createContext(sandbox);
    try {
      this.script = vm.createScript(functionText);
      this.on('input', async function (msg) {
        try {
          let start = process.hrtime();
          context.msg = msg;
          let result = await this.script.runInContext(context);
          sendResults(this, msg._msgid, result);

          let duration = process.hrtime(start);
          let converted = Math.floor((duration[0] * 1e9 + duration[1]) / 10000) / 100;
          this.metric('duration', msg, converted);
          if (process.env.NODE_RED_FUNCTION_TIME)
            this.status({fill: 'yellow', shape: 'dot', text: '' + converted});

        } catch (err) {

          let line = 0;
          let errorMessage;
          let stack = _.get(err, 'stack', '').split(/\r?\n/);
          if (stack.length > 0) {
            while (line < stack.length && stack[line].indexOf('ReferenceError') !== 0)
              line++;

            if (line < stack.length) {
              errorMessage = stack[line];
              let m = /:(\d+):(\d+)$/.exec(stack[line + 1]);
              if (m) {
                let lineno = Number(m[1]) - 1;
                let cha = m[2];
                errorMessage += ' (line ' + lineno + ', col ' + cha + ')';
              }
            }
          }
          if (!errorMessage && !stack)
            errorMessage = _.isObject(err) ? JSON.stringify(err) : err.toString();

          if (!errorMessage && stack)
            errorMessage = _.get(stack, 0, '');

          this.error(errorMessage, msg);
        }
      });
      this.on('close', function () {
        while (node.outstandingTimers.length > 0)
          clearTimeout(node.outstandingTimers.pop());

        while (node.outstandingIntervals.length > 0)
          clearInterval(node.outstandingIntervals.pop());

        this.status({});
      });
    } catch (err) {
      this.error(err);
    }
  }

  RED.nodes.registerType('async-function', FunctionNode);
  RED.library.register('functions');
};

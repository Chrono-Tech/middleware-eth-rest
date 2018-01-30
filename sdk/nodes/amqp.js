const amqp = require('amqp-ts'),
  _ = require('lodash');

module.exports = function (RED) {
  let exchangeTypes = ['direct', 'fanout', 'headers', 'topic'];

  async function initialize (node) {

    if (!node.server)
      node.server = new AmqpServer({servermode: '1'});

    const ctx =  node.context().global;

    node.status({fill: 'green', shape: 'ring', text: 'connecting'});

    try {
      await node.server.claimConnection();

      node.queue = node.server.connection.declareQueue(`${ctx.settings.rabbit.serviceName}.${node.id}`, {durable: node.durableQueue === '1'});

      if (node.ioType !== '4') {
        node.exchange = node.server.connection.declareExchange(node.ioName, exchangeTypes[node.ioType], {durable: node.durableExchange === '1'});
        node.queue.bind(node.exchange, node.topic);
      }

      node.status({fill: 'green', shape: 'dot', text: 'connected'});
      node.initialize();
    } catch (err) {
      node.status({fill: 'red', shape: 'dot', text: 'connect error'});
      node.error('AMQP ' + node.amqpType + ' node connect error: ' + err.message);
    }

    node.on('close', async function () {
      try {
        node.exchange ?
          await node.exchange.close() :
          await node.queue.close();

        node.server.freeConnection();
        node.status({fill: 'red', shape: 'ring', text: 'disconnected'});
      } catch (err) {
        node.server.freeConnection();
        node.status({fill: 'red', shape: 'dot', text: 'disconnect error'});
        node.error('AMQP ' + node.amqpType + ' node disconnect error: ' + err.message);
      }
    });
  }

  //
  //-- AMQP IN ------------------------------------------------------------------
  //
  function AmqpIn (n) {
    let node = this;
    const ctx =  node.context().global;
    RED.nodes.createNode(node, n);
    node.source = n.source;
    node.topic = _.template(n.topic)({config: ctx.settings});
    node.ioType = n.iotype;
    node.noack = n.noack;
    node.ioName = n.ioname;
    node.durableQueue = n.durablequeue;
    node.durableExchange = n.durableexchange;
    node.server = RED.nodes.getNode(n.server);
    // set amqp node type initialization parameters
    node.amqpType = 'input';

    // node specific initialization code
    node.initialize = async function () {
      function Consume (msg) {

        msg.ackMsg = (...args)=>{
          msg.ack(...args);
        };

        msg.nackMsg = (...args)=>{
          msg.nack(...args);
        };

        msg.rejectMsg = (...args)=>{
          msg.reject(...args);
        };

        node.send({
          topic: node.topic || msg.fields.routingKey,
          payload: msg.getContent(),
          amqpMessage: msg
        });
      }

      try {
        await node.queue.activateConsumer(Consume, {noAck: node.noack === '1'});
        node.status({fill: 'green', shape: 'dot', text: 'connected'});
      } catch (err) {
        node.status({fill: 'red', shape: 'dot', text: 'error'});
        node.error('AMQP input error: ' + err.message);
      }

    };
    initialize(node);
  }

  //
  //-- AMQP OUT -----------------------------------------------------------------
  //
  function AmqpOut (n) {
    let node = this;
    const ctx =  node.context().global;
    RED.nodes.createNode(node, n);
    node.source = n.source;
    node.topic = n.topic;
    node.ioType = n.iotype;
    node.noack = n.noack;
    node.durable = n.durable;
    node.ioName = n.ioname;
    node.server = RED.nodes.getNode(n.server);
    // set amqp node type initialization parameters
    node.amqpType = 'output';
    // node specific initialization code
    node.initialize = function () {
      node.on('input', async function (msg) {
        let message = msg.payload ? new amqp.Message(msg.payload, msg.options) :
          new amqp.Message(msg);

        let topic = _.template(node.topic || msg.topic)({config: ctx.settings});

        message.sendTo(node.exchange || node.queue, topic);
      });
    };
    initialize(node);
  }

  //
  //-- AMQP SERVER --------------------------------------------------------------
  //
  function AmqpServer (n) {
    let node = this;
    const ctx =  node.context().global;
    RED.nodes.createNode(node, n);
    // Store local copies of the node configuration (as defined in the .html)
    node.host = n.host || 'localhost';
    node.port = n.port || '5672';
    node.vhost = n.vhost;
    node.keepAlive = n.keepalive;
    node.useTls = n.usetls;
    node.useTopology = n.usetopology;
    node.topology = n.topology;
    node.clientCount = 0;
    node.servermode = n.servermode;
    node.connectionPromise = null;
    node.connection = null;
    node.claimConnection = async function () {

      if (node.clientCount !== 0)
        return node.connectionPromise;

      let urlType = node.useTls ? 'amqps://' : 'amqp://';
      let credentials = _.has(node, 'credentials.user') ? `${node.credentials.user}:${node.credentials.password}@` : '';
      let urlLocation = `${node.host}:${node.port}`;
      if (node.vhost)
        urlLocation += `/${node.vhost}`;

      if (node.keepAlive)
        urlLocation += `?heartbeat=${node.keepAlive}`;

      try {

        node.connection = new amqp.Connection(node.servermode === '1' ? ctx.settings.rabbit.url : urlType + credentials + urlLocation);
        node.connectionPromise = await node.connection.initialized;
        node.log('Connected to AMQP server ' + urlType + urlLocation);
        if (node.useTopology) {
          let topology = JSON.parse(node.topology);
          node.connectionPromise = await node.connection.declareTopology(topology);
        }
      } catch (e) {
        node.error('AMQP-SERVER error creating topology: ' + e.message);
      }

      node.clientCount++;
      return node.connectionPromise;
    };
    node.freeConnection = function () {
      node.clientCount--;
      if (node.clientCount === 0)
        node.connection.close().then(function () {
          node.connection = null;
          node.connectionPromise = null;
          node.log('AMQP server connection ' + node.host + ' closed');
        }).catch(function (e) {
          node.error('AMQP-SERVER error closing connection: ' + e.message);
        });

    };
  }

  // Register the node by name. This must be called before overriding any of the
  // Node functions.
  RED.nodes.registerType('amqp in', AmqpIn);
  RED.nodes.registerType('amqp out', AmqpOut);
  RED.nodes.registerType('amqp-server', AmqpServer, {
    credentials: {
      user: {type: 'text'},
      password: {type: 'password'}
    }
  });
};

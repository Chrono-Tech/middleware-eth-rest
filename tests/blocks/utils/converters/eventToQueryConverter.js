/**
 * Copyright 2017–2018, LaborX PTY
 * Licensed under the AGPL Version 3 license.
 * @author Kirill Sergeev <cloudkserg11@gmail.com>
 */
const expect = require('chai').expect,
  converterGen = require('../../../../utils/converters/eventToQueryConverter'),
  config = require('../../../config'),
  _ = require('lodash');

const getEventName = (countEvents = 1) => {
    return  _.chain(config.nodered.functionGlobalContext.factories.smEvents)
      .groupBy('name')
      .filter(e => e.length === countEvents)
      .shuffle()
      .first()
      .get('0.name')
      .value();
};

const getSignatures = (eventName) => {
    return _.chain(config.nodered.functionGlobalContext.factories.smEvents)
      .filter(e => e.name === eventName)
      .map('signature')
      .value();
};

module.exports = (ctx) => {

  before(() => {
    ctx.converter = config.nodered.functionGlobalContext.libs.utils.converters.eventToQueryConverter;
  });

  it('converterGen/call result without args -  throw error', async () => {
    const query = converterGen(config.nodered.functionGlobalContext.factories.smEvents);
    expect(query).instanceof(Function);
    expect(function () { query(); }).to.throw();
  });

  it('converterGen/call result with empty arg - throw error', async () => {
    const query = converterGen(config.nodered.functionGlobalContext.factories.smEvents);
    expect(() => {query('', {'abba': 1})}).to.throw();
  });

  it('conveterGen/call converter on empty folder and call function with unknown arg - get undefined', async () => {
    const query = converterGen(config.nodered.functionGlobalContext.factories.smEvents);
    expect(query('sdfsdf', {})).to.be.undefined;
  });


  it('call converter on need folder and call function with unknown arg - get undefined', async () => {
    expect(ctx.converter('sdfsdf', {})).to.be.undefined;
  });

  it('call converter with name for one event - get query with single signature', async () => {
    const eventName = getEventName(1);
    const filterEventSignature = getSignatures(eventName)[0];

    const query = ctx.converter(eventName, {'name': 1});
    expect(query.name).to.equal(1);
    expect(query.signature).to.equal(filterEventSignature);
  });

  it('call converter with name for two events - get query with signatures in $or', async () => {
    const eventName = getEventName(2);
    const filterEventSignature = getSignatures(eventName);

    const query = ctx.converter(eventName, {'name': 1, 'query': 2});

    const queryOr = query['$or'];
    expect(queryOr.length).to.equal(2);

    expect(queryOr[0].name).to.equal(1);
    expect(queryOr[0].query).to.equal(2);
    expect(queryOr[0].signature).to.equal(filterEventSignature[0]);


    expect(queryOr[1].name).to.equal(1);
    expect(queryOr[1].query).to.equal(2);
    expect(queryOr[1].signature).to.equal(filterEventSignature[1]);
  });

  it('call converter with name for empty query - get query with signatures in $or', async () => {
    const eventName = getEventName(2);
    const filterEventSignature = getSignatures(eventName);

    const query = ctx.converter(eventName, {});

    const queryOr = query['$or'];
    expect(queryOr.length).to.equal(2);

    expect(queryOr[0].signature).to.equal(filterEventSignature[0]);
    expect(queryOr[1].signature).to.equal(filterEventSignature[1]);
  });


  it('call converter for query with exist signature parameters - get query with rewrite signatures in $or', async () => {
    const eventName = getEventName(2);
    const filterEventSignature = getSignatures(eventName);

    const query = ctx.converter(eventName, {signature: 11});
    const queryOr = query['$or'];
    expect(queryOr.length).to.equal(2);

    expect(queryOr[0].signature).to.equal(filterEventSignature[0]);
    expect(queryOr[1].signature).to.equal(filterEventSignature[1]);
  });

  after(()=>{
    delete ctx.converter;
  })

};

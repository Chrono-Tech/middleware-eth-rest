const config = require('../../config');

module.exports = async (channel, nameTopic) => {
    await channel.assertExchange('events', 'topic', {durable: false});
    const balanceQueue = await channel.assertQueue(`app_${config.rabbit.serviceName}_test.rest`);
    await channel.bindQueue(`app_${config.rabbit.serviceName}_test.rest`, 'events', nameTopic);
    return balanceQueue;
};
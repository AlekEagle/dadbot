"use strict";

module.exports = {
  name: "ping",

  exec: (client, msg, args) => {
    let apiPingTime = client.shards.get(msg.channel.guild.shard.id).latency,
    then = Date.now();
    msg.channel.createMessage('Pinging...').then(message => {
      message.edit(`Pong!\nMessage edit time: \`${(Date.now() - then)}ms\`\nAVG Shard Ping: \`${Math.round(
        (100 *
          client.shards
            .map((s) => s.latency)
            .filter((a) => a !== Infinity)
            .reduce((a, b) => a + b, 0)) /
          client.shards.map((e) => e.latency).filter((a) => a !== Infinity)
            .length
      ) / 100}ms\`\nCurrent shard ping: \`${apiPingTime}ms\``);
    }).catch(err => {});
  },

  options: {
    description: "API response time",
    fullDescription: "it will pong",
  },
};

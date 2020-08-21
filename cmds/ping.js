"use strict";

module.exports = {
  name: "ping",

  exec: (client, msg, args) => {
    var apiPingTime = client.shards
      .filter((s) => msg.channel.guild.shard.id == s.id)
      .map((s) => s.latency)[0];
    client.createMessage(msg.channel.id, "Ping: " + apiPingTime);
  },

  options: {
    description: "API response time",
    fullDescription: "it will pong",
  },
};

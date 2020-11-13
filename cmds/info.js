"use strict";

let nums = require("../functions/numbers");
let time = require("../functions/toReadableTime");
const { cpuUsage } = require('os-utils');
let memory = require("../functions/memoryUsage");

module.exports = {
    name: "info",

    exec: (client, msg, args) => {
        let shards,
            shardsArr = [],
            i = 0;
        msg.channel.sendTyping();
        function getData() {
            return new Promise((resolve, reject) => {
                grafana.remoteEval(i, 'JSON.stringify(client.shards.map(s => { return [s.id, { id: s.id, guildCount: s.client.guilds.filter(g => g.shard.id === s.id).length, userCount: s.client.guilds.filter(g => g.shard.id === s.id).map(g => g.memberCount).reduce((a, b) => a + b, 0), status: s.status.toUpperCase(), ping: s.latency }] }))').then(res => {
                    shardsArr.push(...JSON.parse(res));
                    if (++i < Number(process.env.instances)) getData().then(resolve);
                    else resolve();
                }, reject);
            });
        }
        getData().then(() => {
            shards = new Map(shardsArr);
            cpuUsage((cpuusage) => {
                msg.channel
                    .createMessage({
                        embed: {
                            title: "Info",
                            fields: [
                                {
                                    name: "Commands ran",
                                    value: nums.cmdsRan.toLocaleString(),
                                    inline: true,
                                },
                                {
                                    name: "Messages Read",
                                    value: nums.msgsRead.toLocaleString(),
                                    inline: true,
                                },
                                {
                                    name: "Auto responses answered",
                                    value: nums.responses.toLocaleString(),
                                    inline: true,
                                },
                                {
                                    name: "Server count",
                                    value: shards.map(s => s.guildCount).reduce((a, b) => a + b, 0).toLocaleString(),
                                    inline: true,
                                },
                                {
                                    name: "User count",
                                    value: shards.map(s => s.userCount).reduce((a, b) => a + b, 0).toLocaleString(),
                                    inline: true,
                                },
                                {
                                    name: "Shards",
                                    value: Number(process.env.totalShards),
                                    inline: true,
                                },
                                {
                                    name: "Current Shard",
                                    value: msg.channel.guild.shard.id,
                                    inline: true,
                                },
                                {
                                    name: "Current Cluster",
                                    value: process.env.NODE_APP_INSTANCE,
                                    inline: true
                                },
                                {
                                    name: "Total Clusters",
                                    value: process.env.instances,
                                    inline: true
                                },
                                {
                                    name: "CPU Usage",
                                    value: `${Math.round(cpuusage * 10000) / 100}%`,
                                    inline: true,
                                },
                                {
                                    name: "Memory Usage",
                                    value: `${memory()} / ${memory(require("os").totalmem())}`,
                                    inline: true,
                                },
                                {
                                    name: "Uptime",
                                    value: time(process.uptime()),
                                    inline: true,
                                },
                            ],
                        },
                    })
                    .catch((err) => { });
            });
        });
    },

    options: {
        description: "shows basic info about Dad bot!",
        fullDescription: "There is absloutely nothing else about info."
    },
};

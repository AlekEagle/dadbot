'use strict';

let nums = require('../functions/numbers');
let guildCount = require('../functions/getGuilds');
let time = require('../functions/toReadableTime');
let shards = require('../functions/shardManager');

module.exports = {
    name: 'info',

    exec: (client, msg, args) => {
        msg.channel.sendTyping();
        guildCount().then(guilds => {
            msg.channel.createMessage({
                embed: {
                    title: 'Info',
                    fields: [
                        {
                            name: 'Commands ran',
                            value: nums.cmdsRan,
                            inline: true
                        },
                        {
                            name: 'Messages Read',
                            value: nums.msgsRead,
                            inline: true
                        },
                        {
                            name: 'Auto responses answered',
                            value: nums.responses,
                            inline: true
                        },
                        {
                            name: 'Server count',
                            value: guilds,
                            inline: true
                        },
                        {
                            name: 'User count',
                            value: shards.map(s => s.users.size).reduce((a, b) => a + b, 0),
                            inline: true
                        },
                        {
                            name: 'Shards',
                            value: nums.shardCount,
                            inline: true
                        },
                        {
                            name: 'Current Shard',
                            value: msg.channel.guild.shard.id,
                            inline: true
                        },
                        {
                            name: 'Uptime',
                            value: time(process.uptime())
                        }
                    ]
                }
            }).catch(err => {});
        });
    },

    options: {
        description: 'shows basic info about dad bot!',
        fullDescription: 'There is absloutely nothing else about info.',
        guildOnly: true
    }
}
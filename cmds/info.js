'use strict';

let stats = require('../functions/commandStatistics');
let nums = require('../functions/numbers');
let manager = require('../functions/blacklistManager');
let guildCount = require('../functions/getGuilds');

module.exports = {
    name: 'info',

    exec: (client, msg, args) => {
        stats.updateUses(module.exports.name);
        msg.channel.sendTyping()
        if (!manager.gblacklist.users.includes(msg.author.id)) {
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
                                name: 'Shards',
                                value: nums.shardCount,
                                inline: true
                            },
                            {
                                name: 'Current Shard',
                                value: msg.channel.guild.shard.id,
                                inline: true
                            }
                        ]
                    }
                });
            });
        }else {
            msg.author.getDMChannel().then(chn => {
                chn.createMessage('You have been blacklisted from dad bot! If you think this is a mistake, please go here https://alekeagle.tk/discord and ask AlekEagle#0001 about this issue.').catch(() => {
                    msg.channel.createMessage(`<@${msg.author.id}> You have been blacklisted from dad bot! If you think this is a mistake, please go here https://alekeagle.tk/discord and ask AlekEagle#0001 about this issue.`)
                })
            })
        }
    },

    options: {
        description: 'shows basic info about dad bot!',
        fullDescription: 'There is absloutely nothing else about info.',
        guildOnly: true
    }
}
'use strict';

let guildCount = require('../functions/getGuilds');
let u_wut_m8 = require('../.auth.json');

module.exports = {
    name: 'guildCreate',

    exec: (client, guild) => {
        var bots = guild.members.filter(m => m.bot).length;
        var notBots = guild.memberCount-bots;
        var percent = Math.floor((bots / guild.memberCount) * 100);
        guildCount().then(guilds => {
            client.executeWebhook('547588483502440464', u_wut_m8.webhookTokenThing, {
                embeds: [
                    {
                        title: 'New Server Alert',
                        thumbnail: {
                            url: `${guild.dynamicIconURL('png', 512) ? guild.dynamicIconURL('png', 512).split('?')[0] : 'https://cdn.discordapp.com/avatars/503720029456695306/cb6bb2fc3e552a68064d06f808d71fa8.png'}`
                        },
                        author: {
                            name: `${client.users.get(guild.ownerID).username}#${client.users.get(guild.ownerID).discriminator}`,
                            icon_url: `${client.users.get(guild.ownerID).dynamicAvatarURL('png', 512).split('?')[0]}`,
                            url: `${client.users.get(guild.ownerID).dynamicAvatarURL('png', 512).split('?')[0]}`
                        },
                        fields: [
                            {
                                name: 'Guild Name',
                                value: guild.name,
                                inline: true
                            },
                            {
                                name: 'Guild ID',
                                value: guild.id,
                                inline: true
                            },
                            {
                                name: 'Member Count',
                                value: guild.memberCount,
                                inline: true
                            },
                            {
                                name: 'User to Bot Ratio',
                                value: `${notBots}:${bots}`,
                                inline: true
                            },
                            {
                                name: 'Bot Percentage',
                                value: `${percent}%`,
                                inline: true
                            },
                            {
                                name: 'Categories',
                                value: guild.channels.filter(c => c.type === 4).length,
                                inline: true
                            },
                            {
                                name: 'Text Channels',
                                value: guild.channels.filter(c => c.type === 0).length,
                                inline: true
                            },
                            {
                                name: 'Voice Channels',
                                value: guild.channels.filter(c => c.type === 2).length,
                                inline: true
                            },
                            {
                                name: 'Shard',
                                value: guild.shard.id,
                                inline: true
                            },
                            {
                                name: 'New Guild Count',
                                value: guilds,
                                inline: true
                            }
                        ],
                        footer: {
                            url: client.user.dynamicAvatarURL('png', 512).split('?')[0],
                            text: `${client.user.username}#${client.user.discriminator}`
                        }
                    }
                ]
            });
        });
    }
}
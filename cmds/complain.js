'use strict';

const ms = require('ms');

module.exports = {
    name: 'complain',

    exec: (client, msg, args) => {
        if (args.length <= 2) {
            msg.channel.createMessage(`a complaint ${args.length} word${args.length === 1 ? '' : 's'} long isn't very helpful.`);
        } else {
            client.createMessage('690286309461196912', {
                embed: {
                    title: 'New Complaint',
                    author: {
                        name: `${msg.author.username}#${msg.author.discriminator} (${msg.author.id})`,
                        icon_url: msg.author.dynamicAvatarURL('png', 512).split('?')[0]
                    },
                    description: args.join(' '),
                    fields: [
                        {
                            name: 'Shard',
                            value: client.options.firstShardID,
                            inline: true
                        }, {
                            name: 'User',
                            value: `${msg.author.username}#${msg.author.discriminator} \`<${msg.author.id}>\``,
                            inline: true
                        }, {
                            name: 'Guild',
                            value: msg.channel.guild ? `\`${msg.channel.guild.name} <${msg.channel.guild.id}>\`` : '`Private Message <N/A>\`',
                            inline: true
                        }, {
                            name: 'Channel',
                            value: msg.channel.guild ? `\`${msg.channel.name} <${msg.channel.id}>\`` : `\`Private Message <${msg.channel.id}>\``,
                            inline: true
                        }, {
                            name: 'Time',
                            value: new Date(msg.timestamp).toUTCString(),
                            inline: true
                        }
                    ]
                }
            }).then(() => {
                msg.channel.createMessage('The Dad Bot crew has been notified.');
            }, () => {
                msg.channel.createMessage('That didn\'t work for some reason, try again later.');
            });
        }
    },

    options: {
        description: 'complain about things',
        fullDescription: 'Complain about things in dad bot! Gets sent to the discord server!'
    }
}
'use strict';

const ms = require('ms');

module.exports = {
    name: 'complement',

    exec: (client, msg, args) => {
        if (args.length <= 3) {
            msg.channel.createMessage(`a complement ${args.length} word${args.length === 1 ? '' : 's'} long isn't very helpful.`);
        } else {
            client.createMessage('690286380122767481', {
                embed: {
                    title: 'New Complement',
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
                            value: msg.channel.guild ? `\`${msg.channel.guild.name} <${msg.channel.guild.id}>\`` : '`Private Message <N/A>',
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
            })
        }
    },

    options: {
        description: 'complement the creator about things',
        fullDescription: 'Complement the creator about things in dad bot! Gets sent to the discord server!',
        cooldown: ms('5 minutes'),
        cooldownMessage: 'Hang on there buddy, you have a cooldown for this command, please wait at least 5 minutes before trying again.'
    }
}
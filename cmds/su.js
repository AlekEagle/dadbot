'use strict';

let owners = require('../functions/getOwners');

module.exports = {
    name: 'su',

    exec: (client, msg, args) => {
        var thing;
        if (owners.isOwner(msg.author.id)) {
            var userID = args[0].replace(/</g, '').replace(/@/g, '').replace(/!/g, '').replace(/>/g, '')
            msg.channel.createMessage(`Executing \`${args[1]}\` as \`${client.users.get(userID).username}\`.`)
            var command = args[1]
            if (msg.channel.guild !== undefined) {
                if (msg.channel.guild.members.get(userID) !== undefined) {
                    thing = {
                        ...msg,
                        author: client.users.get(userID),
                        content: `${client.guildPrefixes[msg.channel.guild.id] ? client.guildPrefixes[msg.channel.guild.id] : 'd!'}${args.slice(1).join(' ')}`,
                        member: msg.channel.guild.members.get(userID)
                    }
                }else {
                    thing = {
                        ...msg,
                        author: client.users.get(userID),
                        content: `${client.guildPrefixes[msg.channel.guild.id] ? client.guildPrefixes[msg.channel.guild.id] : 'd!'}${args.slice(1).join(' ')}`
                    }
                }
            }else {
                thing = {
                    ...msg,
                    author: client.users.get(userID),
                    content: `${client.guildPrefixes[msg.channel.guild.id] ? client.guildPrefixes[msg.channel.guild.id] : 'd!'}${args.slice(1).join(' ')}`
                }
            }
            var execedCmd = client.resolveCommand(command).executeCommand(thing, args.slice(2))
            if (typeof execedCmd === 'object' || typeof execedCmd === 'string') {
                msg.channel.createMessage(execedCmd);
            }
        }else client.createMessage(msg.channel.id, 'You need the permission `BOT_OWNER` to use this command!')
        
    },

    options: {
        fullDescription: 'short for substitute user (owner only)',
        usage: '(userID) (command) [command args]',
        hidden: true
    }
}

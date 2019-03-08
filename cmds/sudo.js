'use strict';

let stats = require('../functions/commandStatistics');
let manager = require('../functions/blacklistManager');
let owners = require('../functions/getOwners');

module.exports = {
    name: 'sudo',

    exec: (client, msg, args) => {
        stats.updateUses(module.exports.name);
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
                        content: `a}${args.slice(1).join(' ')}`,
                        member: msg.channel.guild.members.get(userID)
                    }
                }else {
                    thing = {
                        ...msg,
                        author: client.users.get(userID),
                        content: `a}${args.slice(1).join(' ')}`
                    }
                }
            }else {
                thing = {
                    ...msg,
                    author: client.users.get(userID),
                    content: `a}${args.slice(1).join(' ')}`
                }
            }
            if (client.resolveCommand(command).execute(thing) !== undefined) {
                msg.channel.createMessage(client.resolveCommand(command).execute(thing))
            }
        }else if (!manager.gblacklist.users.includes(msg.author.id)) {
            client.createMessage(msg.channel.id, 'You need the permission `BOT_OWNER` to use this command!')
        }else {
            msg.author.getDMChannel().then(chn => {
                chn.createMessage('You have been blacklisted from dad bot! If you think this is a mistake, please go here https://alekeagle.tk/discord and ask AlekEagle#0001 about this issue.').catch(() => {
                    msg.channel.createMessage(`<@${msg.author.id}> You have been blacklisted from dad bot! If you think this is a mistake, please go here https://alekeagle.tk/discord and ask AlekEagle#0001 about this issue.`)
                })
            })
        }
    },

    options: {
        fullDescription: 'executes commands as other users (owner only)',
        usage: '(userID) (command) [command args]',
        hidden: true
    }
}
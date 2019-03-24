'use strict';

let stats = require('../functions/commandStatistics');
let manager = require('../functions/blacklistManager');
let owners = require('../functions/getOwners');

module.exports = {
    name: 'pasta',

    exec: (client, msg, args) => {
        stats.updateUses(module.exports.name);
        if (!manager.gblacklist.users.includes(msg.author.id)) {
            msg.delete().catch(() => {})
            if (msg.member.permission.has('manageGuild') || owners.isOwner(msg.author.id)) {
                if (manager.pblacklist.servers.includes(msg.channel.guild.id)) {
                    manager.manageBlacklist({action: 'remove', blklist: 'pblk', id: msg.channel.guild.id}).then(list => {
                        msg.channel.createMessage('Your server will no longer be affected by pasta mode!').then((message) => {
                            setTimeout(() => {
                                message.delete()
                            },5000)
                        });
                    }, err => {
                        console.error(err);
                        msg.channel.createMessage('Whoops! I just shidded and farded and everything broke! If the problem continues, go here https://alekeagle.tk/discord and complain to the guy named AlekEagle#0001.')
                    });
                }else {
                    manager.manageBlacklist({action: 'add', blklist: 'pblk', id: msg.channel.guild.id}).then(list => {
                        msg.channel.createMessage('Your server will now be affected by pasta mode!').then((message) => {
                            setTimeout(() => {
                                message.delete()
                            },5000)
                        });
                    }, err => {
                        console.error(err);
                        msg.channel.createMessage('Whoops! I just shidded and farded and everything broke! If the problem continues, go here https://alekeagle.tk/discord and complain to the guy named AlekEagle#0001.')
                    });
                }
            }else {
                msg.channel.createMessage('No can do buddy, you just can\'t boss me around me like that, you gotta have permission to do that, the one you need is `MANAGE_SERVER`.')
            }
        }else {
            msg.author.getDMChannel().then(chn => {
                chn.createMessage('You have been blacklisted from dad bot! If you think this is a mistake, please go here https://alekeagle.tk/discord and ask AlekEagle#0001 about this issue.').catch(() => {
                    msg.channel.createMessage(`<@${msg.author.id}> You have been blacklisted from dad bot! If you think this is a mistake, please go here https://alekeagle.tk/discord and ask AlekEagle#0001 about this issue.`)
                })
            })
        }
    },

    options: {
        description: 'toggle pasta mode',
        fullDescription: 'toggle pasta mode',
        guildOnly: true
    }
}
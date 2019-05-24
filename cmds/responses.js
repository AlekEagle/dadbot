'use strict';

let stats = require('../functions/commandStatistics');
let manager = require('../functions/blacklistManager');

const Logger = require('../functions/logger');
const console = new Logger();

module.exports = {
    name: 'responses',

    exec: (client, msg, args) => {
        stats.updateUses(module.exports.name);
        if (!manager.gblacklist.users.includes(msg.author.id)) {
            msg.delete().catch(() => {})
            if (manager.blacklist.users.includes(msg.author.id)) {
                manager.manageBlacklist({action: 'remove', blklist: 'blk', type: 'user', id: `${msg.author.id}`}).then(list => {
                    msg.channel.createMessage('You have been unblacklisted from all auto responses!').then((message) => {
                        setTimeout(() => {
                            message.delete().catch(err => {})
                        }, 5000)
                    });
                }, err => {
                    console.error(err);
                    msg.channel.createMessage('Whoops! I just shidded and farded and everything broke! If the problem continues, go here https://alekeagle.tk/discord and complain to the guy named AlekEagle#0001.')
                });
            }else {
                manager.manageBlacklist({action: 'add', blklist: 'blk', type: 'user', id: `${msg.author.id}`}).then(list => {
                    msg.channel.createMessage('You have been blacklisted from all auto responses!').then((message) => {
                        setTimeout(() => {
                            message.delete().catch(err => {})
                        }, 5000)
                    });
                }, err => {
                    console.error(err);
                    msg.channel.createMessage('Whoops! I just shidded and farded and everything broke! If the problem continues, go here https://alekeagle.tk/discord and complain to the guy named AlekEagle#0001.')
                });
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
        description: 'Toggle blacklist status from the I\'m and kys responses!',
        fullDescription: 'Toggle blacklist status from the I\'m and kys responses!',
        guildOnly: true
    }
}
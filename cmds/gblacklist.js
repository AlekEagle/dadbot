'use strict';

let manager = require('../functions/blacklistManager');
let owners = require('../functions/getOwners');
let lists = require('../functions/lists');

const Logger = require('../functions/logger');
const console = new Logger();

module.exports = {
    name: 'gblacklist',

    exec: (client, msg, args) => {
        args[0] = args[0].replace(/</g, '').replace(/@/g, '').replace(/!/g, '').replace(/>/g, '')
        if (owners.isOwner(msg.author.id)) {
            msg.delete().catch(() => {})
            if (manager.gblacklist.users.includes(args[0])) {
                manager.manageBlacklist({action: 'remove', blklist: 'gblk', type: 'user', id: `${args[0]}`}).then(list => {
                    msg.channel.createMessage(`Unblacklisted ${args[0]} from all commands.`).then((message) => {
                        setTimeout(() => {
                            message.delete()
                        }, 5000)
                    });
                }, err => {
                    console.error(err);
                    msg.channel.createMessage('Whoops! I just shidded and farded and everything broke!')
                });
            }else {
                manager.manageBlacklist({action: 'add', blklist: 'gblk', type: 'user', id: `${args[0]}`}).then(list => {
                    msg.channel.createMessage(`Blacklisted ${args[0]} from all commands.`).then((message) => {
                        setTimeout(() => {
                            message.delete()
                        }, 5000)
                    });
                }, err => {
                    console.error(err);
                    msg.channel.createMessage('Whoops! I just shidded and farded and everything broke!')
                });
            }
        }else client.createMessage(msg.channel.id, 'You need the permission `BOT_OWNER` to use this command!')
        
    },

    options: {
        hidden: true
    }
}
'use strict';

let owners = require('../functions/getOwners');
let manager = require('../functions/manageBlacklist');
const Logger = require('../functions/logger');
const console = new Logger();

module.exports = {
    name: 'channelresponses',

    exec: (client, msg, args) => {
            if (msg.member.permission.has('manageGuild') || owners.isOwner(msg.author.id)) {
                msg.delete().catch(() => {})
                if (manager.blacklist.channels.includes(args[0] ? msg.channel.guild.channels.get(args[0].replace(/(<#!?|>)/g, '')) ? args[0].replace(/(<#!?|>)/g, '') : msg.channel.id : msg.channel.id)) {
                    manager.manageBlacklist({action: 'remove', blklist: 'blk', type: 'channel', id: `${args[0] ? msg.channel.guild.channels.get(args[0].replace(/(<#!?|>)/g, '')) ? args[0].replace(/(<#!?|>)/g, '') : msg.channel.id : msg.channel.id}`}).then(list => {
                        msg.channel.createMessage(`The channel <#${args[0] ? msg.channel.guild.channels.get(args[0].replace(/(<#!?|>)/g, '')) ? args[0].replace(/(<#!?|>)/g, '') : msg.channel.id : msg.channel.id}> has been unblacklisted from all auto responses!`).then((message) => {
                        setTimeout(() => {
                            message.delete().catch(err => {})
                        }, 5000)
                    });
                    }, err => {
                        console.error(err);
                        msg.channel.createMessage('Whoops! I just shidded and farded and everything broke! If the problem continues, go here https://alekeagle.tk/discord and complain to the guy named AlekEagle#0001.')
                    });
                }else {
                    manager.manageBlacklist({action: 'add', blklist: 'blk', type: 'channel', id: `${args[0] ? msg.channel.guild.channels.get(args[0].replace(/(<#!?|>)/g, '')) ? args[0].replace(/(<#!?|>)/g, '') : msg.channel.id : msg.channel.id}`}).then(list => {
                        msg.channel.createMessage(`The channel <#${args[0] ? msg.channel.guild.channels.get(args[0].replace(/(<#!?|>)/g, '')) ? args[0].replace(/(<#!?|>)/g, '') : msg.channel.id : msg.channel.id}> has been blacklisted from all auto responses!`).then((message) => {
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
                msg.channel.createMessage('No can do buddy, you just can\'t boss me around me like that, you gotta have permission to do that, the one you need is `MANAGE_SERVER`.')
            }
        
    },

    options: {
        description: 'Toggle blacklist status for the channel from the I\'m and kys responses!',
        fullDescription: 'Toggle blacklist status for the channel from the I\'m and kys responses!',
        guildOnly: true,
        usage: '[channelID|channel mention]'
    }
}
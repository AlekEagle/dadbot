'use strict';

let manager = require('../functions/blacklistManager');
let owners = require('../functions/getOwners');
let request = require('request');

module.exports = {
    name: 'remoteeval',

    exec: (client, msg, args) => {
        if (!manager.gblacklist.users.includes(msg.author.id)) {
            if(owners.isOwner(msg.author.id)) {
                request({
                    method: 'POST',
                    url: `http://127.0.0.1:420${args[0]}/eval`,
                    body: args.slice(1).join(' ')
                }, (err, res, body) => {
                    if (err) {
                        msg.channel.createMessage('Unable to contact shard.')
                    }else {
                        msg.channel.createMessage(body.toString())
                    }
                })
            }else {
                msg.channel.createMessage('You need the permission `BOT_OWNER` to use this!')
            }
        }else {
            msg.author.getDMChannel().then(chn => {
                chn.createMessage('You have been blacklisted from Dad Bot! If you think this is a mistake, please go here https://alekeagle.tk/discord and ask AlekEagle#0001 about this issue.').catch(() => {
                    msg.channel.createMessage(`<@${msg.author.id}> You have been blacklisted from Dad Bot! If you think this is a mistake, please go here https://alekeagle.tk/discord and ask AlekEagle#0001 about this issue.`)
                })
            })
        }
    },

    options: {
        fullDescription: 'Eval on other shards!',
        hidden: true
    }
}
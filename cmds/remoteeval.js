'use strict';

let owners = require('../functions/getOwners');
let request = require('request');

module.exports = {
    name: 'remoteeval',

    exec: (client, msg, args) => {
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
    },

    options: {
        fullDescription: 'Eval on other shards!',
        hidden: true
    }
}
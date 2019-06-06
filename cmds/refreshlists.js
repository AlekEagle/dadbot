'use strict';

let owners = require('../functions/getOwners');
let lists = require('../functions/lists');

module.exports = {
    name: 'refreshlists',

    exec: (client, msg, args) => {
        if (owners.isOwner(msg.author.id)) {
            lists.reloadlists()
            msg.channel.createMessage('Lists should be refreshed now.')
        }else client.createMessage(msg.channel.id, 'You need the permission `BOT_OWNER` to use this command!')
        
    },

    options: {
        hidden: true,
        aliases: [
            'relists'
        ]
    }
}
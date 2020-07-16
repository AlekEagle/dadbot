'use strict';

let owners = require('../functions/getOwners');
let shards = require('../functions/shardManager');

module.exports = {
    name: 'setplaying',

    exec: (client, msg, args) => {
        if (owners.isOwner(msg.author.id)) {
            var playing = '';
            var text = args.slice(2).join(' ');
            var n = text.split(' | ')[1];
            text = text.split(' | ')[0];
            switch(parseInt(args[1])) {

            }
            shards.map(s => s).forEach(s => {
                s.editStatus(args[0], {
                    name: text,
                    type: playing,
                    url: n
                });
            });

            let types = {
                playing: '**Playing**',
                streaming: '**Streaming**',
                
            }

            msg.channel.createMessage('I am now ' + playing + ' ' + text);

        }else client.createMessage(msg.channel.id, 'You need the permission `BOT_OWNER` to use this command!')
        
    },

    options: {
        hidden: true,
        fullDescription: 'sets what the bot is playing. (Owner only command)',
        usage: '(status) (type) (game name)'
    }
}
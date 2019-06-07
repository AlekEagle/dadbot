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
            if (parseInt(args[1]) === 0) {
                playing = '**Playing**';
            }else if (parseInt(args[1]) === 1) {
                playing = '**Streaming**';
            }else if (parseInt(args[1]) === 2) {
                playing = '**Listening to**';
            }else if (parseInt(args[1]) === 3) {
                playing = '**Watching**';
            }
            shards.map(s => s).forEach(s => {
                s.editStatus(args[0], {
                    name: text,
                    type: parseInt(args[1]),
                    url: n
                });
            });
            msg.channel.createMessage('I am now ' + playing + ' ' + text);

        }else client.createMessage(msg.channel.id, 'You need the permission `BOT_OWNER` to use this command!')
        
    },

    options: {
        hidden: true,
        fullDescription: 'sets what the bot is playing. (Owner only command)',
        usage: '(status) (type) (game name)'
    }
}
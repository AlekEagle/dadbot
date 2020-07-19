'use strict';

let owners = require('../functions/getOwners');
let shards = require('../functions/shardManager');

module.exports = {
    name: 'setplaying',

    exec: (client, msg, args) => {
        if (owners.isOwner(msg.author.id)) {
            var text = args.slice(args[1].toLowerCase() === 'listening' ? 3 : 2).join(' ');
            var n = text.split(' | ')[1];
            text = text.split(' | ')[0];

            let types = {
                playing: '**Playing**',
                streaming: '**Streaming**',
                'listening to': '**Listening To**',
                watching: '**Watching**'
            }

            shards.map(s => s).forEach(s => {
                s.editStatus(args[0], {
                    name: text,
                    type: Object.keys(types).indexOf(args.slice(1, args[1].toLowerCase() === 'listening' ? 3 : 2).join(' ')),
                    url: n
                });
            });

            msg.channel.createMessage('I am now ' + types[args.slice(1, args[1].toLowerCase() === 'listening' ? 3 : 2).join(' ')] + ' ' + text);

        }else client.createMessage(msg.channel.id, 'You need the permission `BOT_OWNER` to use this command!')
        
    },

    options: {
        hidden: true,
        fullDescription: 'sets what the bot is playing. (Owner only command)',
        usage: '(status) (type) (game name)'
    }
}
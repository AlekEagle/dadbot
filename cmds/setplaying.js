'use strict';

let stats = require('../functions/commandStatistics');
let manager = require('../functions/blacklistManager');
let owners = require('../functions/getOwners');

module.exports = {
    name: 'setplaying',

    exec: (client, msg, args) => {
        stats.updateUses(module.exports.name);
        if (owners.isOwner(msg.author.id)) {
            var playing = ''
            var args = msg.content.split(' ').splice(1);
            var text = msg.content.split(' ').splice(3).join(' ')
            var n = text.indexOf(' | ')
            text = text.substring(0, n != -1 ? n : text.length);
            if (parseInt(args[1]) === 0) {
                playing = '**Playing**'
            }else if (parseInt(args[1]) === 1) {
                playing = '**Streaming**'
            }else if (parseInt(args[1]) === 2) {
                playing = '**Listening to**'
            }else if (parseInt(args[1]) === 3) {
                playing = '**Watching**'
            }
            client.editStatus(args[0], {
                name: text,
                type: parseInt(args[1])
    //            url: msg.content.split(' | ').splice(1).join('')
            })
            return 'I am now ' + playing + ' ' + text;

        }else if (!manager.gblacklist.users.includes(msg.author.id)) {
            client.createMessage(msg.channel.id, 'You need the permission `BOT_OWNER` to use this command!')
        }else {
            msg.author.getDMChannel().then(chn => {
                chn.createMessage('You have been blacklisted from dad bot! If you think this is a mistake, please go here https://alekeagle.tk/discord and ask AlekEagle#0001 about this issue.').catch(() => {
                    msg.channel.createMessage(`<@${msg.author.id}> You have been blacklisted from dad bot! If you think this is a mistake, please go here https://alekeagle.tk/discord and ask AlekEagle#0001 about this issue.`)
                })
            })
        }
    },

    options: {
        hidden: true,
        fullDescription: 'sets what the bot is playing. (Owner only command)',
        usage: '(status) (type) (game name)'
    }
}
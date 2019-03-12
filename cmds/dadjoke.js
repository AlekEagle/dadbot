'use strict';

let stats = require('../functions/commandStatistics');
let manager = require('../functions/blacklistManager');
let lists = require('../functions/lists');

module.exports = {
    name: 'dadjoke',

    exec: (client, msg, args) => {
        stats.updateUses(module.exports.name);
        if (!manager.gblacklist.users.includes(msg.author.id)) {
            msg.channel.createMessage(lists.jokes[Math.floor(Math.random() * lists.jokes.length)]).catch(() => {});
        }else {
            msg.author.getDMChannel().then(chn => {
                chn.createMessage('You have been blacklisted from dad bot! If you think this is a mistake, please go here https://alekeagle.tk/discord and ask AlekEagle#0001 about this issue.').catch(() => {
                    msg.channel.createMessage(`<@${msg.author.id}> You have been blacklisted from dad bot! If you think this is a mistake, please go here https://alekeagle.tk/discord and ask AlekEagle#0001 about this issue.`)
                })
            })
        }
    },

    options: {
        description: 'Have Dad Bot tell you a "great" joke!'
    }
}
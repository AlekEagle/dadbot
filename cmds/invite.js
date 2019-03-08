'use strict';

let stats = require('../functions/commandStatistics');
let manager = require('../functions/blacklistManager');

module.exports = {
    name: 'invite',

    exec: (client, msg, args) => {
        stats.updateUses(module.exports.name);
        if (!manager.gblacklist.users.includes(msg.author.id)) {
            return 'go here https://alekeagle.tk/dad_bot/invite\nand https://alekeagle.tk/discord for the support server';
        }else {
            msg.author.getDMChannel().then(chn => {
                chn.createMessage('You have been blacklisted from dad bot! If you think this is a mistake, please go here https://alekeagle.tk/discord and ask AlekEagle#0001 about this issue.').catch(() => {
                    msg.channel.createMessage(`<@${msg.author.id}> You have been blacklisted from dad bot! If you think this is a mistake, please go here https://alekeagle.tk/discord and ask AlekEagle#0001 about this issue.`)
                })
            })
        }
    },

    options: {
        description: 'The invite to the bot!',
        fullDescription: 'The invite to the bot!'
    }
}
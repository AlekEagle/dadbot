'use strict';

let stats = require('../functions/commandStatistics');
let manager = require('../functions/blacklistManager');

module.exports = {
    name: 'vote',

    exec: (client, msg, args) => {
        stats.updateUses(module.exports.name);
        if (!manager.gblacklist.users.includes(msg.author.id)) {
            msg.channel.createMessage(`Thanks for voting for me! It will help me get noticed so more people know that Dad Bot is here! https://discordbots.org/bot/503720029456695306/vote`)
        }else {
            msg.author.getDMChannel().then(chn => {
                chn.createMessage('You have been blacklisted from dad bot! If you think this is a mistake, please go here https://alekeagle.tk/discord and ask AlekEagle#0001 about this issue.').catch(() => {
                    msg.channel.createMessage(`<@${msg.author.id}> You have been blacklisted from dad bot! If you think this is a mistake, please go here https://alekeagle.tk/discord and ask AlekEagle#0001 about this issue.`)
                })
            })
        }
    },
    
    options: {
        description: 'Voting will help me a lot!',
        fullDescription: 'Voting will help me a lot!'
    }
}
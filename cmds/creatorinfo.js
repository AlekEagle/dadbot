'use strict';

let manager = require('../functions/blacklistManager');
let stats = require('../functions/commandStatistics');

module.exports = {
    name: 'creatorinfo',

    exec: (client, msg, args) => {
        stats.updateUses(module.exports.name);
        if (!manager.gblacklist.users.includes(msg.author.id)) {
            msg.channel.createMessage('To go see some other projects the person who made me has made goto https://discordbots.org/user/222882552472535041');
        }else {
            msg.author.getDMChannel().then(chn => {
                chn.createMessage('You have been blacklisted from dad bot! If you think this is a mistake, please go here https://alekeagle.tk/discord and ask AlekEagle#0001 about this issue.').catch(() => {
                    msg.channel.createMessage(`<@${msg.author.id}> You have been blacklisted from dad bot! If you think this is a mistake, please go here https://alekeagle.tk/discord and ask AlekEagle#0001 about this issue.`)
                })
            })
        }
    },

    options: {
        description: 'Shows creator info!',
        fullDescription: 'Shows creator info!'
    }
}
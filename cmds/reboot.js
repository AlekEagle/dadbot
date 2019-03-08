'use strict';

let stats = require('../functions/commandStatistics');
let manager = require('../functions/blacklistManager');
let owners = require('../functions/getOwners');

module.exports = {
    name: 'reboot',

    exec: (client, msg, args) => {
        stats.updateUses(module.exports.name);
        if (owners.isAdminOwner(msg.author.id)) {
            client.createMessage(msg.channel.id, `Alright ${msg.author.username}! Imma go take a nap!`)
            setTimeout(() => {
                process.exit(0);
            }, 100)
        }else if (!manager.gblacklist.users.includes(msg.author.id)) {
            client.createMessage(msg.channel.id, 'You need the permission `BOT_ADMIN_OWNER` to use this command!')
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
        fullDescription: 'Reboots the bot (owner only command)',
        aliases: [
            'restart',
            'reboit'
        ]
    }
}
'use strict';

let stats = require('../functions/commandStatistics');
let manager = require('../functions/blacklistManager');

module.exports = {
    name: 'gamesrob',

    exec: (client, msg, args) => {
        stats.updateUses(module.exports.name);
        if (!manager.gblacklist.users.includes(msg.author.id)) {
            msg.channel.createMessage('GamesROB is one of the few discord bots to have the ability to play uno on discord! You can play Hangman, Minesweeper, Connect 4, and many more games like this! Go check them out at https://discordbots.org/bot/gamesrob')
        }else {
            msg.author.getDMChannel().then(chn => {
                chn.createMessage('You have been blacklisted from dad bot! If you think this is a mistake, please go here https://alekeagle.tk/discord and ask AlekEagle#0001 about this issue.').catch(() => {
                    msg.channel.createMessage(`<@${msg.author.id}> You have been blacklisted from dad bot! If you think this is a mistake, please go here https://alekeagle.tk/discord and ask AlekEagle#0001 about this issue.`)
                })
            })
        }
    },

    options: {
        description: `One of our partners!`,
        fullDescription: `GamesROB is one of Dad Bots partners!`
    }
}
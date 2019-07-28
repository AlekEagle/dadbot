'use strict';


module.exports = {
    name: 'invite',

    exec: (client, msg, args) => {
            msg.channel.createMessage('go here https://alekeagle.com/Dad_bot/invite\nand https://alekeagle.com/discord for the support server');
        
    },

    options: {
        description: 'The invite to the bot!',
        fullDescription: 'The invite to the bot!'
    }
}
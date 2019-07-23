'use strict';


module.exports = {
    name: 'vote',

    exec: (client, msg, args) => {
        msg.channel.createMessage(`Thanks for voting for me! It will help me get noticed so more people know that Mom Bot is here! https://discordbots.org/bot/503720029456695306/vote`)
    },
    
    options: {
        description: 'Voting will help me a lot!',
        fullDescription: 'Voting will help me a lot!'
    }
}
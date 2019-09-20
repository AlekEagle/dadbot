'use strict';

module.exports = {
    name: 'mc',
    
    exec: (client, msg, args) => {
        msg.channel.createMessage('https://alekeagle.com/minecraft/ for more info.');
    },
    
    options: {
        description: 'mc',
        
    }
}

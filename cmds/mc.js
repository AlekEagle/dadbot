'use strict';

module.exports = {
    name: 'mc',
    
    exec: (client, msg, args) => {
        msg.channel.createMessage('Join the Official Dad Bot Minecraft server here: mc.alekeagle.com');
    },
    
    options: {
        description: 'mc',
        
    }
}

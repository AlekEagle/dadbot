'use strict';


module.exports = {
    name: 'creatorinfo',

    exec: (client, msg, args) => {
            msg.channel.createMessage('To go see some other projects the person who made me has made goto https://alekeagle.com');
        
    },

    options: {
        description: 'Shows creator info!',
        fullDescription: 'Shows creator info!'
    }
}
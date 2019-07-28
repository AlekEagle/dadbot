'use strict';

module.exports = {
    name: 'patreon',

    exec: (client, msg, args) => {
        msg.channel.createMessage('Go support me and the person who made me by supporting them on patreon https://alekeagle.com/patreon');
    },

    options: {
        description: 'Patreon',
        fullDescription: 'Patreon'
    }
}
'use strict';

const owners = require('../functions/getOwners');

module.exports = {
    name: 'reloadevts',

    exec: (client, msg, args) => {
        if (owners.isOwner(msg.author.id)) {
            msg.channel.createMessage(`Unloading all events not important to the CommandClient and loading \`${require('fs').readdirSync('./events').length}\` events.`)
            setTimeout(() => {
                loadEvts(true);
            }, 500);
        }
    },

    options: {
        description: 'Reloads event handlers',
        fullDescription: 'Reloads reloads event handlers (owner only)',
        hidden: true,
        aliases: [
            'reevts'
        ]
    }
}
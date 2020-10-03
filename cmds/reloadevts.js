'use strict';

const owners = require('../functions/getOwners');

module.exports = {
    name: 'reloadevts',

    exec: (client, msg, args) => {
        owners.isOwner(msg.author.id).then(owner => {
            if (owner) {
                msg.channel.createMessage(`Unloading all events not important to the CommandClient and loading \`${require('fs').readdirSync('./events').length}\` events.`)
                setTimeout(() => {
                    loadEvts(true);
                }, 500);
            } else client.createMessage(msg.channel.id, 'You need the permission `BOT_OWNER` to use this command!')
        });
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
'use strict';

const owners = require('../functions/getOwners');

module.exports = {
    name: 'reloadevts',

    exec: (client, msg, args) => {

        let i = 0;
        function getData() {
            return new Promise((resolve, reject) => {
                grafana.remoteEval(i, 'loadEvts(true);').then(res => {
                    if (++i < Number(process.env.instances)) getData().then(resolve);
                }, reject);
            });
        }
        owners.isOwner(msg.author.id).then(owner => {
            if (owner) {
                getData().then(() => {
                    msg.channel.createMessage(`Unloading all events not important to the CommandClient and loading \`${require('fs').readdirSync('./events').length}\` events.`)
                });
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
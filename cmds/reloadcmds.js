'use strict';

const owners = require('../functions/getOwners');

module.exports = {
    name: 'reloadcmds',

    exec: (client, msg, args) => {
        if (owners.isOwner(msg.author.id)) {
            msg.channel.createMessage(`Unloading \`${Object.values(client.commands).filter(c => c.label !== 'help').map(c => c.label).length}\` commands and reloading \`${require('fs').readdirSync('./cmds').length}\` commands.`)
            setTimeout(() => {
                loadCmds(true);
            }, 500);
        }
    },

    options: {
        description: 'Reloads commands',
        fullDescription: 'Reloads commands (owner only)',
        hidden: true,
        aliases: [
            'recmds'
        ]
    }
}
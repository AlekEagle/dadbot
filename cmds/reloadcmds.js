'use strict';

const owners = require('../functions/getOwners');

module.exports = {
    name: 'reloadcmds',

    exec: (client, msg, args) => {
        owners.isOwner(msg.author.id).then(owner => {
            if (owner) {
                msg.channel.createMessage(`Unloading \`${Object.values(client.commands).filter(c => c.label !== 'help').map(c => c.label).length}\` commands and reloading \`${require('fs').readdirSync('./cmds').length}\` commands.`)
                setTimeout(() => {
                    loadCmds(true);
                }, 500);
            }else client.createMessage(msg.channel.id, 'You need the permission `BOT_OWNER` to use this command!')
        });
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
'use strict';

const owners = require('../functions/getOwners');
const ms = require('ms');
const exec = require('child_process').exec;

module.exports = {
    name: 'update',

    exec: (client, msg, args) => {
        owners.isOwner(msg.author.id).then(owner => {
            if (owner) {
                msg.channel.createMessage(`Updating <a:loading1:470030932775272469>`).then(message => {
                    exec('git pull', (err, stdout, stderr) => {
                        setTimeout(() => {
                            loadCmds(true);
                            loadEvts(true);
                            message.edit('Update complete.');
                        }, ms('15secs'));
                    });
                });
            }else client.createMessage(msg.channel.id, 'You need the permission `BOT_OWNER` to use this command!')
        });
    },

    options: {
        hidden: true
    }
}

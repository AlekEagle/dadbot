'use strict';

const owners = require('../functions/getOwners');
const ms = require('ms');
const exec = require('child_process').exec;

module.exports = {
    name: 'update',

    exec: (client, msg, args) => {
        if (owners.isOwner(msg.author.id)) {
            msg.channel.createMessage(`Updating <a:loading1:470030932775272469>`).then(message => {
                exec('git pull', (err, stdout, stderr) => {
                    setTimeout(() => {
                        loadCmds(true);
                        loadEvts(true);
                        message.edit('Update complete.');
                    }, ms('15secs'));
                });
            });
        }
    },

    options: {
        hidden: true
    }
}

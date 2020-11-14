'use strict';

const owners = require('../functions/getOwners');
const ms = require('ms');
const exec = require('child_process').exec;

module.exports = {
    name: 'update',

    exec: (client, msg, args) => {
        let i = 0;
        function getData() {
            return new Promise((resolve, reject) => {
                grafana.remoteEval(i, 'loadCmds(true);loadEvts(true);').then(res => {
                    if (++i < Number(process.env.instances)) getData().then(resolve);
                    else resolve();
                }, reject);
            });
        }

        owners.isOwner(msg.author.id).then(owner => {
            if (owner) {
                if (!process.env.DEBUG) {
                    msg.channel.createMessage(`Updating <a:loading1:470030932775272469>`).then(message => {
                        exec('git pull', (err, stdout, stderr) => {
                            setTimeout(() => {
                                getData().then(() => {
                                    message.edit('Update complete.');
                                });
                            }, ms('15secs'));
                        });
                    });
                } else {
                    getData().then(() => {
                        msg.channel.createMessage('Update complete.');
                    });
                }
            } else client.createMessage(msg.channel.id, 'You need the permission `BOT_OWNER` to use this command!')
        });
    },

    options: {
        hidden: true
    }
}

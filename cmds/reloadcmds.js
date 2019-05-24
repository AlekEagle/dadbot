'use strict';

const owners = require('../functions/getOwners');
const request = require('request');
let stats = require('../functions/commandStatistics');
let nums = require('../functions/numbers');

const Logger = require('../functions/logger');
const console = new Logger();

module.exports = {
    name: 'reloadcmds',

    exec: (client, msg, args) => {
        stats.updateUses(module.exports.name);
        if (owners.isOwner(msg.author.id)) {
            msg.channel.createMessage(`Unloading \`${Object.values(client.commands).filter(c => c.label !== 'help').map(c => c.label).length}\` commands and reloading \`${require('fs').readdirSync('./cmds').length}\` commands.`)
            setTimeout(() => {
                for (let thing = 0; thing < nums.shardCount; thing ++) {
                    request({
                        method: 'GET',
                        url: `http://127.0.0.1:420${thing}/reloadcmds`
                    }, (err, res, body) => {
                        if (err) {
                            console.error('can\'t connect to the other shards')
                            console.error(err)
                        }
                    })
                }
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
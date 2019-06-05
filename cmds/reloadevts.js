'use strict';

const owners = require('../functions/getOwners');
const request = require('request');
const nums = require('../functions/numbers');
let stats = require('../functions/commandStatistics');

const Logger = require('../functions/logger');
const console = new Logger();

module.exports = {
    name: 'reloadevts',

    exec: (client, msg, args) => {
        stats.updateUses(module.exports.name);
        if (owners.isOwner(msg.author.id)) {
            msg.channel.createMessage(`Unloading all events not important to the CommandClient and loading \`${require('fs').readdirSync('./events').length}\` events.`)
            setTimeout(() => {
                for (let thing = 0; thing < nums.shardCount; thing ++) {
                    request({
                        method: 'GET',
                        url: `http://127.0.0.1:420${thing}/reloadevts`
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
        description: 'Reloads event handlers',
        fullDescription: 'Reloads reloads event handlers (owner only)',
        hidden: true,
        aliases: [
            'reevts'
        ]
    }
}
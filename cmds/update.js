'use strict';

const owners = require('../functions/getOwners');
const request = require('request');
let nums = require('../functions/numbers');
const exec = require('child_process').exec;

const Logger = require('../functions/logger');
const console = new Logger();

module.exports = {
    name: 'update',

    exec: (client, msg, args) => {
        if (owners.isOwner(msg.author.id)) {
            msg.channel.createMessage(`Updating...`).then(message => {
                exec('git pull', (err, stdout, stderr) => {
                    for (let thing = 0; thing < nums.shardCount; thing++) {
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
                    for (let thing = 0; thing < nums.shardCount; thing++) {
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
                    message.edit('Update complete.')
                });
            });
        }
    }
}
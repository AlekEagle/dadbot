'use strict';

let nums = require('../functions/numbers');
let shards = require('../functions/shardManager');
const request = require('request');

module.exports = () => {
    return new Promise((resolve, reject) => {
        resolve(shards.map(s => s.guilds.size).reduce((a, b) => a + b, 0));
    });
}

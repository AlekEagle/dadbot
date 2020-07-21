'use strict';

let shards = require('../functions/shardManager');

module.exports = () => {
    return new Promise((resolve, reject) => {
        resolve(shards.map(s => s.guilds.size).reduce((a, b) => a + b, 0));
    });
}

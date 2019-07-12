'use strict';

const shards = require('../functions/shardManager');

module.exports = (user) => shards.map(s => s.users.filter(u => u.id === user)).reduce((a, b) => a.concat(b))[0]

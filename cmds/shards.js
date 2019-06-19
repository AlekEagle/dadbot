'use strict';

const shards = require('../functions/shardManager');

module.exports = {
    name: 'shards',

    exec: (client, msg, args) => {
        let currentShard = client.options.firstShardID;
        let output = ['SHARD|GUILDS |USERS  |STATUS      |PING     ', '-----+-------+-------+------------+------']
        shards.map(s => `${' '.repeat(5 - (s.options.firstShardID === currentShard ? `>${s.options.firstShardID}`.length : s.options.firstShardID.toString().length))}${s.options.firstShardID === currentShard ? `>${s.options.firstShardID}` : s.options.firstShardID}|${s.guilds.size}${' '.repeat(7 - s.guilds.size.toString().length)}|${s.users.size}${' '.repeat(7 - s.users.size.toString().length)}|${s.shards.get(s.options.firstShardID).status.toUpperCase()}${' '.repeat(12 - s.shards.get(s.options.firstShardID).status.length)}|${s.shards.get(s.options.firstShardID).latency !== Infinity ? `${s.shards.get(s.options.firstShardID).latency}ms` : 'N/A'}${' '.repeat(`${s.shards.get(s.options.firstShardID).latency}ms`.length > 9 ? 9 - 'N/A'.length : 9 - `${s.shards.get(s.options.firstShardID).latency}ms`.length)}`).forEach(e => output.push(e));
        output.push(`TOTAL|${shards.map(s => s.guilds.size).reduce((a, b) => a + b, 0)}${' '.repeat(7 - shards.map(s => s.guilds.size).reduce((a, b) => a + b, 0).toString().length)}|${shards.map(s => s.users.size).reduce((a, b) => a + b, 0)}${' '.repeat(7 - shards.map(s => s.users.size).reduce((a, b) => a + b, 0).toString().length)}|N/A         |AVG ${shards.map(s => s.shards.get(s.options.firstShardID).latency).filter(a => a !== Infinity).reduce((a, b) => a + b,0) / shards.map(e => e.shards.get(e.options.firstShardID).latency).filter(a => a !== Infinity).length}ms`);
        msg.channel.createMessage(`\`\`\`${output.join('\n')}\`\`\``)
    },

    options: {
        description: 'Show other shards info',
        fullDescription: 'Show other shards info'
    }
}
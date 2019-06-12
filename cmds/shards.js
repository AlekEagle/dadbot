'use strict';

const shards = require('../functions/shardManager');

module.exports = {
    name: 'shards',

    exec: (client, msg, args) => {
        let currentShard = client.options.firstShardID;
        let output = ['SHARD|GUILDS |USERS  |STATUS      |PING     ', '-----+-------+-------+------------+------']
        output.push(shards.map(s => `${' '.repeat(5 - s.options.firstShardID === currentShard ? `>${s.options.firstShardID}`.length : s.options.firstShardID)}${s.options.firstShardID === currentShard ? `>${s.options.firstShardID}` : s.options.firstShardID}|${s.guilds.size}${' '.repeat(7 - s.guilds.size.length)}|${s.users.size}${' '.repeat(7 - s.users.size.length)}|${s.shards.get(s.options.firstShardID).status.toUpperCase()}${' '.repeat(12 - s.shards.get(s.options.firstShardID).status.length)}|${s.shards.get(s.options.firstShardID).latency}ms${' '.repeat(9 - `${s.shards.get(s.options.firstShardID).latency}ms`.length)}`))
        output.push(`TOTAL|${shards.map(s => s.guilds.size).reduce((a, b) => a + b, 0)}${' '.repeat(7 - shards.map(s => s.guilds.size).reduce((a, b) => a + b, 0).length)}|${shards.map(s => s.users.size).reduce((a, b) => a + b, 0)}${' '.repeat(7 - shards.map(s => s.users.size).reduce((a, b) => a + b, 0).length)}|N/A         |AVG ${shards.map(s => s.shards.get(s.options.firstShardID).latency).reduce((a, b) => a + b,0) / shards.size}ms`);
        msg.channel.createMessage(`\`\`\`${output.join('\n')}\`\`\``)
    }
}
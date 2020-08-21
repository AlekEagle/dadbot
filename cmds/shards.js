'use strict';

const shards = require('../functions/shardManager');

module.exports = {
    name: 'shards',

    exec: (client, msg, args) => {
        let e = shards.map(s => s.shards.get(s.options.firstShardID).status.toUpperCase().charAt(0));
        let overallShardStatus = {};
        for (let i = 0; i < e.length; i++) {
            if (!overallShardStatus[e[i]]) overallShardStatus[e[i]] = 0;
            overallShardStatus[e[i]]++;
        }
        let currentShard = client.options.firstShardID,
            curInd = 0;
        let output = [`SHARD|GUILDS |USERS  |STATUS${Object.keys(overallShardStatus).map(k => `${k}: ${overallShardStatus[k]}`).join(', ').length >= shards.map(s => s.shards.get(s.options.firstShardID).status.length).sort((a, b) => a - b).reverse()[0] ? Object.keys(overallShardStatus).map(k => `${k}: ${overallShardStatus[k]}`).join(', ').length < 6 ? '' : ' '.repeat(Object.keys(overallShardStatus).map(k => `${k}: ${overallShardStatus[k]}`).join(', ').length - 6) : shards.map(s => s.shards.get(s.options.firstShardID).status.length).sort((a, b) => a - b).reverse()[0] < 6 ? '' : ' '.repeat(shards.map(s => s.shards.get(s.options.firstShardID).status.length).sort((a, b) => a - b).reverse()[0] - 6)}|PING     \n-----+-------+-------+------${Object.keys(overallShardStatus).map(k => `${k}: ${overallShardStatus[k]}`).join(', ').length >= shards.map(s => s.shards.get(s.options.firstShardID).status.length).sort((a, b) => a - b).reverse()[0] ? Object.keys(overallShardStatus).map(k => `${k}: ${overallShardStatus[k]}`).join(', ').length < 6 ? '' : '-'.repeat(Object.keys(overallShardStatus).map(k => `${k}: ${overallShardStatus[k]}`).join(', ').length - 6) : shards.map(s => s.shards.get(s.options.firstShardID).status.length).sort((a, b) => a - b).reverse()[0] < 6 ? '' : '-'.repeat(shards.map(s => s.shards.get(s.options.firstShardID).status.length).sort((a, b) => a - b).reverse()[0] - 6)}+------`];
        shards.map(s => `${' '.repeat(5 - (s.options.firstShardID === currentShard ? `>${s.options.firstShardID}`.length : s.options.firstShardID.toString().length))}${s.options.firstShardID === currentShard ? `>${s.options.firstShardID}` : s.options.firstShardID}|${s.guilds.size}${' '.repeat(7 - s.guilds.size.toString().length)}|${s.users.size}${' '.repeat(7 - s.users.size.toString().length)}|${s.shards.get(s.options.firstShardID).status.toUpperCase()}${Object.keys(overallShardStatus).map(k => `${k}: ${overallShardStatus[k]}`).join(', ').length <= shards.map(s => s.shards.get(s.options.firstShardID).status.length).sort((a, b) => a - b).reverse()[0] ? shards.map(s => s.shards.get(s.options.firstShardID).status.length).sort((a, b) => a - b).reverse()[0] < 6 ? ' '.repeat(6 - shards.map(s => s.shards.get(s.options.firstShardID).status.length).sort((a, b) => a - b).reverse()[0]) : ' '.repeat(shards.map(s => s.shards.get(s.options.firstShardID).status.length).sort((a, b) => a - b).reverse()[0] - s.shards.get(s.options.firstShardID).status.toUpperCase().length) : ' '.repeat(6 - Object.keys(overallShardStatus).map(k => `${k}: ${overallShardStatus[k]}`).join(', ').length - shards.map(s => s.shards.get(s.options.firstShardID).status.length).sort((a, b) => a - b).reverse()[0])}|${s.shards.get(s.options.firstShardID).latency !== Infinity ? `${s.shards.get(s.options.firstShardID).latency}ms` : 'N/A'}${' '.repeat(`${s.shards.get(s.options.firstShardID).latency}ms`.length > 9 ? 9 - 'N/A'.length : 9 - `${s.shards.get(s.options.firstShardID).latency}ms`.length)}`).forEach(e => {
            if ((output[curInd] + e).length >= 2000) {
                output[++curInd] = e;
            } else {
                output[curInd] += '\n' + e;
            }
        });
        let totals = `TOTAL|${shards.map(s => s.guilds.size).reduce((a, b) => a + b, 0)}${' '.repeat(7 - shards.map(s => s.guilds.size).reduce((a, b) => a + b, 0).toString().length)}|${shards.map(s => s.users.size).reduce((a, b) => a + b, 0)}${' '.repeat(7 - shards.map(s => s.users.size).reduce((a, b) => a + b, 0).toString().length)}|${Object.keys(overallShardStatus).map(k => `${k}: ${overallShardStatus[k]}`).join(', ')}${shards.map(s => s.shards.get(s.options.firstShardID).status.length).sort((a, b) => a - b).reverse()[0] >= Object.keys(overallShardStatus).map(k => `${k}: ${overallShardStatus[k]}`).join(', ').length ? Object.keys(overallShardStatus).map(k => `${k}: ${overallShardStatus[k]}`).join(', ').length < 6 ? ' '.repeat(6 - Object.keys(overallShardStatus).map(k => `${k}: ${overallShardStatus[k]}`).join(', ').length) : ' '.repeat(shards.map(s => s.shards.get(s.options.firstShardID).status.length).sort((a, b) => a - b).reverse()[0] - Object.keys(overallShardStatus).map(k => `${k}: ${overallShardStatus[k]}`).join(', ').length) : ' '.repeat(shards.map(s => s.shards.get(s.options.firstShardID).status.length).sort((a, b) => a - b).reverse()[0] - Object.keys(overallShardStatus).map(k => `${k}: ${overallShardStatus[k]}`).join(', ').length)}|AVG ${Math.round(100 * shards.map(s => s.shards.get(s.options.firstShardID).latency).filter(a => a !== Infinity).reduce((a, b) => a + b, 0) / shards.map(e => e.shards.get(e.options.firstShardID).latency).filter(a => a !== Infinity).length) / 100}ms`;
        if ((output[curInd] + totals).length >= 2000) {
            output[++curInd] = totals;
        } else {
            output[curInd] += '\n' + totals;
        }
        output.forEach(a => msg.channel.createMessage(`\`\`\`${a}\`\`\``));
    },

    options: {
        description: 'Show other shards info',
        fullDescription: 'Show other shards info'
    }
}
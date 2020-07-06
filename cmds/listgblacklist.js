'use strict';

const owners = require('../functions/getOwners');
const shards = require('../functions/shardManager');
const manager = require('../functions/blacklistManager');

module.exports = {
    name: 'lgblacklist',

    exec: (client, msg, args) => {
        if (owners.isOwner(msg.author.id)) {
            if (manager.gblacklist.users.length === 0) {
                msg.channel.createMessage('Surprising, no one has been blacklisted from the bot yet. <:thinking:695050564156784671>');
                return;
            }
            let curInd = 0,
                output = [], 
                blacklistedUsers = manager.gblacklist.users.map(u => shards.map(s => s.users.get(u))).reduce((a, b) => a.concat(b)).filter(a => a !== undefined).filter((i, o, s) => s.map(e => e.id).indexOf(i.id) == o);
            output[curInd] = `NAME${' '.repeat(blacklistedUsers.map(e => `${e.username}#${e.discriminator}`.length).sort((a, b) => a - b).reverse()[0] - 4)}|USERID${' '.repeat(blacklistedUsers.map(e => e.id.length).sort((a, b) => a - b).reverse()[0] - 6)}`;
            output[curInd] += `\n${'-'.repeat(blacklistedUsers.map(e => `${e.username}#${e.discriminator}`.length).sort((a, b) => a - b).reverse()[0])}+${'-'.repeat(blacklistedUsers.map(e => e.id.length).sort((a, b) => a - b).reverse()[0])}`;
            blacklistedUsers.forEach(e => {
                let a = `${e.username}#${e.discriminator}${' '.repeat(blacklistedUsers.map(e => `${e.username}#${e.discriminator}`.length).sort((a, b) => a - b).reverse()[0] - `${e.username}#${e.discriminator}`.length)}|${e.id}${' '.repeat(blacklistedUsers.map(e => e.id.length).sort((a, b) => a - b).reverse()[0] - e.id.length)}`;
                if ((output[curInd] + a).length >= 2000) {
                    output[++curInd] = a;
                }else {
                    output[curInd] += '\n' + a;
                }
            });
            output.forEach(a => msg.channel.createMessage(`\`\`\`${a}\`\`\``));
            if (blacklistedUsers.length !== manager.gblacklist.users.length) {
                msg.channel.createMessage(`There are ${manager.gblacklist.users.length - blacklistedUsers.length} id(s) that can't be linked back to a user however, those are: \`\`\`\n${manager.gblacklist.users.filter(u => shards.map(s => s.users.get(u)).filter(a => a !== undefined).length === 0 ? true : false).join('\n')}\`\`\``)
            }
        } else msg.channel.createMessage('You need the permission `BOT_OWNER` to use this command!');
    },
    
    options: {
        description: 'Lists the blacklisted users of dad bot.',
        hidden: true
    }
}
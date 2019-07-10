'use strict';

let prefixes = require('../functions/managePrefixes');
let owners = require('../functions/getOwners');

module.exports = {
    name: 'prefix',

    exec: (client, msg, args) => {
        if (owners.isOwner(msg.author.id) || msg.member.permission.has('manageGuild')) {
            if (args[0] && args[0] !== client.commandOptions.prefix) {
                prefixes.managePrefixes({action: 'add', serverID: msg.channel.guild.id, prefix: args.join(' ').replace(/((?!^)-(?!\/)-$)/, ' ').replace(/-\/-/, '--')}).then(() => {
                    msg.channel.createMessage(`The server prefix is now \`${client.guildPrefixes[msg.channel.guild.id]}\``);
                }, () => {
                    msg.channel.createMessage('Whoops! I just shidded and farded and everything broke! If the problem continues, go here https://alekeagle.tk/discord and complain to the guy named AlekEagle#0001.');
                });
            }else {
                prefixes.managePrefixes({action: 'remove', serverID: msg.channel.guild.id}).then(() => {
                    msg.channel.createMessage(`The server prefix is now \`${client.commandOptions.prefix}\``);
                }, () => {
                    msg.channel.createMessage('Whoops! I just shidded and farded and everything broke! If the problem continues, go here https://alekeagle.tk/discord and complain to the guy named AlekEagle#0001.');
                });
            }
        }else {
            msg.channel.createMessage('No can do buddy, you just can\'t boss me around me like that, you gotta have permission to do that, the one you need is `MANAGE_SERVER`.');
        }
    },

    options: {
        description: 'sets the prefix! (put "--" at the end of the prefix to indicate a space, if you don\'t want a space at the end, but you want two dashes at the end, use "-/-")',
        usage: '[prefix[-- for space at end of prefix, -/- to escape the space at the end of the prefix and have a space]|leave blank for default prefix]',
        longDescription: 'Examples: \'bruh--moment\' = \'bruh--moment\'\n\'bruh moment--\' = \'bruh moment \'\n\'bruh moment-/-\' = \'bruh moment--\''
    }
}
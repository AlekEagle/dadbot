'use strict';

let manager = require('../functions/blacklistManager');
let nums = require('../functions/numbers');
let lists = require('../functions/lists');

module.exports = {
    name: 'messageCreate',

    exec: (client, msg) => {
        nums.msgsRead = ++nums.msgsRead
        try{var u = msg.member;if(manager.pblacklist.servers.includes(msg.channel.guild.id)) {u.edit({nick: lists.pastas[Math.floor(Math.random() * lists.pastas.length)]}).catch(() => {})}}catch (err) {}
        if (msg.channel.type === 1) return;
        if (manager.blacklist.servers.includes(msg.channel.guild.id)) {
        }else {
            if (!msg.author.bot && !manager.blacklist.users.includes(msg.author.id) && !manager.gblacklist.users.includes(msg.author.id)) {
                if (msg.content.match(/(\n| |^)[i|I]'?’?[m|M](\n| |$)/) || msg.content.match(/(\n| |^)[i|I] [a|A][m|M](\n| |$)/)) {
                    var ind = -1;
                    if (msg.content.match(/(\n| |^)[i|I]'?’?[m|M](\n| |$)/)) {
                        ind = msg.content.match(/(\n| |^)[i|I]'?’?[m|M](\n| |$)/).index + 2
                        if (msg.content.slice(ind).toLowerCase().substring(0, 1) === '\'') ind = ind + 1
                        if (msg.content.slice(ind).toLowerCase().substring(0, 1) === 'm') ind = ind + 1
                        if (msg.content.slice(ind).toLowerCase().substring(0, 1) === '’') ind = ind + 1
                        if (msg.content.slice(ind).toLowerCase().substring(0, 1) === ' ') ind = ind + 1
                    }else if (msg.content.match(/(\n| |^)[i|I] [a|A][m|M](\n| |$)/)) {
                        ind = msg.content.match(/(\n| |^)[i|I] [a|A][m|M](\n| |$)/).index + 5
                    }
                    if (msg.channel.id === '467853504468353024' || msg.channel.id === '457439774446452738' || ind === -1) {
                    }else if (msg.content.slice(ind).toLowerCase() !== `${msg.channel.guild.members.get(client.user.id).nick ? msg.channel.guild.members.get(client.user.id).nick.toLowerCase() : client.user.username.toLowerCase()}`){
                        nums.responses = ++nums.responses
                        msg.channel.createMessage(`Hi ${msg.content.slice(ind)}, I'm ${msg.channel.guild.members.get(client.user.id).nick ? msg.channel.guild.members.get(client.user.id).nick : 'Dad'}!`).catch(() => {});
                    }else if (msg.content.slice(ind).toLowerCase() === `${msg.channel.guild.members.get(client.user.id).nick ? msg.channel.guild.members.get(client.user.id).nick.toLowerCase() : client.user.username.toLowerCase()}`) {
                        nums.responses = ++nums.responses
                        msg.channel.createMessage(`You're not ${msg.channel.guild.members.get(client.user.id).nick ? msg.channel.guild.members.get(client.user.id).nick : client.user.username}, I'm ${msg.channel.guild.members.get(client.user.id).nick ? msg.channel.guild.members.get(client.user.id).nick : client.user.username}!`).catch(() => {});
                    }
                }
                if (msg.content.toLowerCase().includes('kys') || msg.content.toLowerCase().includes('kill your self') || msg.content.toLowerCase().includes('kill ur self')) {
                    nums.responses = ++nums.responses
                    msg.channel.createMessage(`That was very rude ${msg.member.nick ? msg.member.nick : msg.member.username}, instead, take your own advice.`).catch(() => {});
                }else if (msg.content.toLowerCase().includes('shut up') || msg.content.toLowerCase().includes('shut your up') || msg.content.toLowerCase().includes('stfu') || msg.content.toLowerCase().includes('shut the fuck up') || msg.content.toLowerCase().includes('shut ur up') || msg.content.toLowerCase().includes('shut the hell your mouth') || msg.content.toLowerCase().includes('shut the hell your up')) {
                    nums.responses = ++nums.responses
                    msg.channel.createMessage(`Listen here ${msg.member.nick ? msg.member.nick : msg.member.username}, I will not tolerate you saying the words that consist of the letters 's h u t  u p' being said in this server, so take your own advice and close thine mouth in the name of the christian minecraft server owner.`).catch(() => {});
                }
            }
        }
    }
}
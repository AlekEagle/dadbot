'use strict';

let stats = require('../functions/commandStatistics');
let manager = require('../functions/blacklistManager');
let lists = require('../functions/lists');

module.exports = {
    name: 'embarrass',

    exec: (client, msg, args) => {
        var user;
        if (args[0]) {
            args[0] = args[0].replace(/(<@!?|>)/g, '')
            user = client.users.get(args[0]);
        }else {
            user = msg.author
        }
        var avatarURL = user.dynamicAvatarURL('png', 1024).split('?')[0]
        stats.updateUses(module.exports.name);
        if (!manager.gblacklist.users.includes(user.id)) {
            if (msg.channel.guild.members.get('503720029456695306').permission.has('manageWebhooks')) {
                var embarrassingThing = lists.embarrassingThings[Math.floor(Math.random() * lists.embarrassingThings.length)]
                if (lists.embarrassingThings[0] === embarrassingThing || lists.embarrassingThings[1] === embarrassingThing) {
                    msg.channel.createMessage(`<@${user.id}> ${embarrassingThing}`);
                }else {
                    msg.channel.createWebhook({name: user.username}).then(thing => {
                        client.executeWebhook(thing.id, thing.token, {content: embarrassingThing, avatarURL: avatarURL, username: user.username});
                        setTimeout(() => {
                            client.deleteWebhook(thing.id);
                        }, 5000);
                    }, () => {});
                }
            }else msg.channel.createMessage('No can do bub, in order for me to embarrass people I need the permission `MANAGE_WEBHOOKS`.')
        }else {
            msg.author.getDMChannel().then(chn => {
                chn.createMessage('You have been blacklisted from dad bot! If you think this is a mistake, please go here https://alekeagle.tk/discord and ask AlekEagle#0001 about this issue.').catch(() => {
                    msg.channel.createMessage(`<@${msg.author.id}> You have been blacklisted from dad bot! If you think this is a mistake, please go here https://alekeagle.tk/discord and ask AlekEagle#0001 about this issue.`)
                })
            })
        }
    },

    options: {
        description: 'Embarrass yourself or others (mite b offensive)',
        fullDescription: 'it just embarrasses you, what else do you need help with?',
        guildOnly: true,
        usage: '[user mention|userID]'
    }
}
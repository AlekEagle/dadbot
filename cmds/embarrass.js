'use strict';

let stats = require('../functions/commandStatistics');
let manager = require('../functions/blacklistManager');
let lists = require('../functions/lists');

module.exports = {
    name: 'embarrass',

    exec: (client, msg, args) => {
        stats.updateUses(module.exports.name);
        if (!manager.gblacklist.users.includes(msg.author.id)) {
            if (msg.channel.guild.members.get('503720029456695306').permission.has('manageWebhooks')) {
                var embarrassingThing = lists.embarrassingThings[Math.floor(Math.random() * lists.embarrassingThings.length)]
                if (lists.embarrassingThings[0] === embarrassingThing || lists.embarrassingThings[1] === embarrassingThing) {
                    msg.channel.createMessage(`<@${msg.author.id}> ${embarrassingThing}`);
                }else {
                    var avatarURL = msg.author.dynamicAvatarURL('png', 1024).split('?')[0]
                    msg.channel.createWebhook({name: msg.author.username}).then(thing => {
                        client.executeWebhook(thing.id, thing.token, {content: embarrassingThing, avatarURL: avatarURL, username: msg.member.username});
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
        description: 'Embarrass yourself (mite b offensive)',
        fullDescription: 'it just embarrasses you, what else do you need help with?',
        guildOnly: true,
        aliases: [
            "emberrass"
        ]
    }
}
'use strict';

let lists = require('../functions/lists');

module.exports = {
    name: 'embarrass',

    exec: (client, msg, args) => {
        var user;
        if (args[0] && msg.channel.guild.members.get(args[0].replace(/(<@!?|>)/g, '')) !== undefined) {
            args[0] = args[0].replace(/(<@!?|>)/g, '')
            user = msg.channel.guild.members.get(args[0]);
        } else {
            user = msg.member
        }
        var avatarURL = client.users.get(user.id).dynamicAvatarURL('png', 2048).split('?')[0]
        if (msg.channel.permissionsOf(client.user.id).has('manageWebhooks')) {
            var embarrassingThing = lists.embarrassingThings[Math.floor(Math.random() * lists.embarrassingThings.length)]
            if (lists.embarrassingThings[0] === embarrassingThing || lists.embarrassingThings[1] === embarrassingThing) {
                msg.channel.createMessage(`<@${user.id}> ${embarrassingThing}`);
            } else {
                msg.channel.createWebhook({ name: user.username }).then(thing => {
                    setTimeout(() => {
                        client.executeWebhook(thing.id, thing.token, { content: embarrassingThing, avatarURL: avatarURL, username: user.nick ? user.nick : user.username }).catch(() => { });
                        setTimeout(() => {
                            client.deleteWebhook(thing.id);
                        }, 5000);
                    }, 100);
                }, () => { });
            }
        } else msg.channel.createMessage('No can do bub, in order for me to embarrass people I need the permission `MANAGE_WEBHOOKS`.')

    },

    options: {
        description: 'Embarrass yourself or others (mite b offensive)',
        fullDescription: 'it just embarrasses you, what else do you need help with?',
        guildOnly: true,
        usage: '[user mention|userID]'
    }
}
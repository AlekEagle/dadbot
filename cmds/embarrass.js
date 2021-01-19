'use strict';

const Eris = require('eris'),
  lists = require('../functions/lists'),
  webhookUtils = require('../functions/webhookUtils');

module.exports = {
  name: 'embarrass',

  exec: async (client, msg, args) => {
    if (msg.channel.permissionsOf(client.user.id).has('manageWebhooks')) {
      let random = Math.floor(Math.random() * lists.embarrassingThings.length),
        user = msg.member;
      if (msg.mentions[0] instanceof Eris.ExtendedUser) {
        user = msg.channel.guild.members.get(msg.mentions[0].id);
      }
      if (random > 1) {
        let dadhook = await webhookUtils.getGuildDadhook(msg.channel.guild);

        (await dadhook.changeChannel(msg.channel.id)).send({
          content: lists.embarrassingThings[random],
          avatarURL: user.user.dynamicAvatarURL('png', 2048),
          username:
            user.nickname && user.nickname.length > 1
              ? user.nickname
              : user.username
        });
      } else {
        msg.channel.createMessage(
          `${user.mention} ${lists.embarrassingThings[random]}`
        );
      }
    } else
      msg.channel.createMessage(
        'No can do bub, in order for me to embarrass people I need the permission `MANAGE_WEBHOOKS`.'
      );
  },

  options: {
    description: 'Embarrass yourself or others (mite b offensive)',
    fullDescription:
      'it just embarrasses you, what else do you need help with?',
    guildOnly: true,
    usage: '[user mention|userID]'
  }
};

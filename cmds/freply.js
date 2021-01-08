'use strict';

const suggestions = require('../functions/suggestionsManager'),
  owners = require('../functions/getOwners');

module.exports = {
  name: 'freply',

  exec: (client, msg, args) => {
    owners.isOwner(msg.author.id).then(owner => {
      if (owner) {
        suggestions.reply(args[0], msg, args.slice(1).join(' ')).then(
          suggestion => {
            msg.channel.createMessage('Reply sent!');
          },
          err => {
            msg.channel.createMessage(err.message);
          }
        );
      } else
        client.createMessage(
          msg.channel.id,
          'You need the permission `BOT_OWNER` to use this command!'
        );
    });
  },

  options: {
    description: 'Reply to feedback',
    hidden: true
  }
};

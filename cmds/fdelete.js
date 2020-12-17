'use strict';

const suggestions = require('../functions/suggestionsManager'),
  owners = require('../functions/getOwners');

module.exports = {
  name: 'fdelete',

  exec: (client, msg, args) => {
    owners.isOwner(msg.author.id).then(owner => {
      suggestions.Suggestions.findOne({
        where: {
          id: args[0]
        }
      }).then(suggestion => {
        if (msg.author.id !== suggestion.userID && !owner) {
          msg.channel.createMessage(
            "You don't have the permission to delete that feedback entry!"
          );
        } else if (msg.author.id === suggestion.userID || owner) {
          suggestions.delete(args[0], client).then(() => {
            msg.channel.createMessage('Done!');
          });
        }
      });
    });
  },

  options: {
    description: 'Delete Feedback',
    usage: '<feedback id>'
  }
};

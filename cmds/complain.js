'use strict';

const suggestions = require('../functions/suggestionsManager');

module.exports = {
  name: 'complain',

  exec: (client, msg, args) => {
    if (args.length <= 2) {
      msg.channel.createMessage(
        `a complaint ${args.length} word${
          args.length === 1 ? '' : 's'
        } long isn't very helpful.`
      );
    } else {
      suggestions.create(0, msg, args.join(' ')).then(
        suggestion => {
          msg.channel.createMessage(
            `The Dad Bot crew has been notified. Your feedback ID for reference is \`${suggestion.id}\`.`
          );
        },
        () => {
          msg.channel.createMessage(
            "That didn't work for some reason, try again later."
          );
        }
      );
    }
  },

  options: {
    description: 'complain about things',
    fullDescription:
      'Complain about things in dad bot! Gets sent to the discord server!'
  }
};

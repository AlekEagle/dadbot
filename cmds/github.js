'use strict';

module.exports = {
  name: 'github',

  exec: (client, msg, args) => {
    msg.channel.createMessage(
      "https://github.com/AlekEagle/dadbot don't judge my code."
    );
  },

  options: {
    aliases: ['gh', 'gith', 'ghub']
  }
};

'use strict';

module.exports = {
  name: 'patreon',

  exec: (client, msg, args) => {
    msg.channel.createMessage(
      "Alright, you're probably thinking \"Why do you have a patreon if the bot doesn't need to be paid for?\" and to that I say, yes, the patreon isn't required at all, but having patreon supporters makes a tremendous difference when working on a project like this, it helps me pay for the costs of a server so I can host the bot, the internet bandwidth the bot uses, and other things that people want (the Minecraft server for example) so, if you can/if you feel like it, become a patron here: https://alekeagle.com/patreon"
    );
  },

  options: {
    description: 'Patreon',
    fullDescription: 'Patreon'
  }
};

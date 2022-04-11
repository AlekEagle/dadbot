import fetch from 'node-fetch';
import { CommandModule } from '../types';

const MessWithAlek: CommandModule = {
  name: 'bugdev',

  async handler(client, msg, args) {
    if (args.length === 0) {
      return 'You need to specify a message to send.';
    }
    const res = await fetch('https://dumb-alek.alekeagle.com/prompt', {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain',
        'Authorization': process.env.messWithAlekToken
      },
      body: args.join(' ')
    });

    switch (res.status) {
      case 204:
        return 'Sent! It will be displayed on all of his computers!';
      case 502:
        return "I'm sorry, I couldn't connect to the server. Please try again later.";
      case 503:
        return "He isn't on any of his computers. Try again later.";
      default:
        console.log(await res.text());
        return 'Uhhh... something went wrong. Try again later.';
    }
  },

  options: {
    description: "Send a message to all of Alek's computers.",
    fullDescription: "Send a message to all of Alek's computers.",
    usage: '<message>',
    aliases: ['messwithalek', 'messwithalerk'],
    cooldown: 5000,
    cooldownMessage: 'You can only use this command once every 5 seconds.'
  }
};

export default MessWithAlek;

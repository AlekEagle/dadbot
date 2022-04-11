import fetch from 'node-fetch';
import { CommandModule } from '../types';

const MessWithAlek: CommandModule = {
  name: 'bugdev',

  async handler(client, msg, args) {
    const res = await fetch('https://dumb-alek.alekeagle.com/prompt', {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain',
        'Authorization': process.env.messWithAlekToken
      },
      body: msg.content
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
    aliases: ['messwithalek', 'messwithalerk']
  }
};

export default MessWithAlek;

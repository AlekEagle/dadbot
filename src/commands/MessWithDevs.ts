import fetch from 'node-fetch';
import { CommandModule } from '../types';

const MessWithDevs: CommandModule = {
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
    const json = await res.json();

    switch (res.status) {
      case 200:
        return `Sent! It will be displayed on \`\`\`\n${json
          .map(
            (x: { username: string; computer: string }) =>
              `${x.username}'s computer named ${x.computer}`
          )
          .join('\n')}\n\`\`\``;
      case 502:
        return "I'm sorry, I couldn't connect to the server. Please try again later.";
      case 503:
        return "He isn't on any of his computers. Try again later.";
      default:
        return 'Uhhh... something went wrong. Try again later.';
    }
  },

  options: {
    description: "Send a message to all of Alek's computers.",
    fullDescription: "Send a message to all of Alek's computers.",
    usage: '<message>'
  }
};

export default MessWithDevs;

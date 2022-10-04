import fetch from 'node-fetch';

const DevComputers: CommandModule = {
  name: 'devcomputers',

  async handler(msg, args) {
    const res = await fetch('https://dumb-alek.alekeagle.com/clients', {
      method: 'GET',
      headers: {
        Authorization: process.env.MESS_WITH_ALEK_TOKEN
      }
    });
    const json = await res.json();

    if (json.length === 0) {
      return 'There are no computers connected. Try again later.';
    }

    return `These computers are currently connected: \`\`\`\n${json
      .map(
        (x: { username: string; computer: string }) =>
          `${x.username}'s computer named ${x.computer}`
      )
      .join('\n')}\n\`\`\``;
  },

  options: {
    description: 'Get a list of all active computers.',
    fullDescription: 'Get a list of all active computers.',
    usage: ''
  }
};

export default DevComputers;

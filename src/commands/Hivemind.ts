import {
    SlashCommand,
    OptionBuilder,
    Subcommand,
  } from 'oceanic.js-interactions';
  
  const hivemind = new SlashCommand(
    'hivemind',
    'Interact with the developers via the hivemind communication tunnel!',
    {},
  );
  
  const hivemindSendMessage = new Subcommand(
    'send',
    'Send a message to the developers!',
    {
      message: OptionBuilder.String('The message to send', true),
    },
    async (interaction, { message }) => {
      interaction.defer();
  
      const res = await fetch('https://dumb-alek.alekeagle.com/prompt', {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain',
          'Authorization': process.env.MESS_WITH_ALEK_TOKEN,
        },
        body: message,
      });
  
      switch (res.status) {
        case 200:
          const json = (await res.json()) as {
            username: string;
            computer: string;
          }[];
          interaction.createFollowup({
            content: `Sent! It will be displayed on \`\`\`\n${json
              .map((x) => `${x.username}'s computer named ${x.computer}`)
              .join('\n')}\n\`\`\``,
          });
        case 502:
          interaction.createFollowup({
            content:
              "I'm sorry, I couldn't connect to the server. Please try again later.",
          });
        case 503:
          interaction.createFollowup({
            content: 'There are no computers connected. Try again later.',
          });
        default:
          interaction.createFollowup({
            content: 'Uhhh... something went wrong. Try again later.',
          });
      }
    },
  );
  
  hivemind.addSubcommand(hivemindSendMessage);
  
  const hivemindComputers = new Subcommand(
    'computers',
    'See which developers are online right now!',
    {},
    async (interaction) => {
      interaction.acknowledge();
      const res = await fetch('https://dumb-alek.alekeagle.com/clients', {
        method: 'GET',
        headers: {
          Authorization: process.env.MESS_WITH_ALEK_TOKEN,
        },
      });
      const json = (await res.json()) as { username: string; computer: string }[];
  
      if (json.length === 0) {
        interaction.createFollowup({
          content: 'There are no computers connected. Try again later.',
        });
      }
  
      interaction.createFollowup({
        content: `These computers are currently connected: \`\`\`\n${json
          .map((x) => `${x.username}'s computer named ${x.computer}`)
          .join('\n')}\n\`\`\``,
      });
    },
  );
  
  hivemind.addSubcommand(hivemindComputers);
  
  export default hivemind;
  
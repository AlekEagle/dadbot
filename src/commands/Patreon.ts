import { SlashCommand } from 'oceanic.js-interactions';

const patreon = new SlashCommand(
  'patreon',
  'Help support Dad Bot and the creator!',
  {},
  {},
  (interaction) => {
    interaction.createMessage({
      content:
        "You like Dad Bot? Help support the creator by supporting him on patreon! This is the 5th major rewrite of the Dad Bot code, it'll help pay for the server the bot runs on. If you want to support the bot, please become a patron at https://patreon.com/alekeagle",
    });
  },
);

export default patreon;

import { SlashCommand } from 'oceanic.js-interactions';

const creatorInfo = new SlashCommand(
  'creatorinfo',
  'Show some info about the creator of the bot!',
  {},
  {},
  (interaction) => {
    interaction.createMessage({
      content:
        "Thanks for using Dad Bot! If you like Dad Bot, then you'll like some of the other things I've made! Check out my website to see more of what I do! https://alekeagle.com/",
    });
  },
);

export default creatorInfo;

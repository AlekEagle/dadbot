import { SlashCommand } from 'oceanic.js-interactions';
import Lists from '../utils/Lists';

const mio = new SlashCommand(
  'mio',
  'Just Mio.',
  {},
  {},
  async (interaction) => {
    interaction.createMessage({
      content: Lists.mio[Math.floor(Math.random() * Lists.mio.length)],
    });
  },
);

export default mio;

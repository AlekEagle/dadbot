import { CommandModule } from '../types';
import Lists from '../utils/Lists';

const Mio: CommandModule = {
  name: 'mio',

  async handler(client, msg, args) {
    return {
      embed: {
        image: { url: Lists.mio[Math.floor(Math.random() * Lists.mio.length)] }
      }
    };
  },

  options: {
    description: 'Just Mio.'
  }
};

export default Mio;

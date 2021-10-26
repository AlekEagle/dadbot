import { CommandModule } from '../types';
import Lists from '../utils/Lists';

const Dab: CommandModule = {
  name: 'dab',

  async handler(client, msg, args) {
    return {
      embed: {
        image: {
          url: Lists.dadsDabbing[
            Math.floor(Math.random() * Lists.dadsDabbing.length)
          ]
        }
      }
    };
  },

  options: {
    description: 'Dads dabbing!!!'
  }
};

export default Dab;

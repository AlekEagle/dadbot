import { CommandModule } from '../types';
import Lists from '../utils/Lists';

const Dadjoke: CommandModule = {
  name: 'dadjoke',

  async handler(client, msg, args) {
    return Lists.jokes[Math.floor(Math.random() * Lists.jokes.length)];
  },

  options: {
    description: 'Dad jokes'
  }
};

export default Dadjoke;

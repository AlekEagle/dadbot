import { CommandModule } from '../types';
import Table from '../utils/Table';

const __command: CommandModule = {
  name: 'test',

  async handler(client, msg, args) {
    let thing = new Table({ joe: [''] });
  },

  options: {
    guildOnly: true
  }
};

export default __command;

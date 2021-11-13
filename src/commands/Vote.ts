import { CommandModule } from '../types';

const Vote: CommandModule = {
  name: 'vote',

  handler:
    'You like Dad Bot? Vote for Dad Bot on top.gg and help more people see Dad Bot on top.gg! https://top.gg/bot/503720029456695306/vote',

  options: {
    description: 'Help support the bot and the creator!'
  }
};

export default Vote;

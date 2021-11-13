import { CommandModule } from '../types';

const Patreon: CommandModule = {
  name: 'patreon',

  handler:
    "You like Dad Bot? Help support the creator by supporting him on patreon! This is the 4th major rewrite of the Dad Bot code, it'll help pay for the server the bot runs on, and other services the bot might rely on, for example Google API. If you want to support the bot, please become a patron at https://patreon.com/alekeagle",

  options: {
    description: 'Help support the bot and the creator!'
  }
};

export default Patreon;

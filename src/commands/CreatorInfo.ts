import { CommandModule } from '../types';

const CreatorInfo: CommandModule = {
  name: 'creatorinfo',

  handler:
    "Thanks for using Dad Bot! If you like Dad Bot, then you'll like some of the other things I've made! Check out my website to see more of what I do! https://alekeagle.com/",

  options: {
    description: 'Show some info about the creator of the bot!'
  }
};

export default CreatorInfo;

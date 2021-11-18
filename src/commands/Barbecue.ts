import { CommandModule } from '../types';
import { incrementBarbecuesServed } from '../utils/Statistics';

const Barbecue: CommandModule = {
  name: 'barbecue',

  handler() {
    incrementBarbecuesServed();
    return {
      embed: {
        title: "Here's your hotdog",
        image: {
          url: 'https://alekeagle.me/8YgKdGJORB.png'
        }
      }
    };
  },

  options: {
    description: 'mmm barbecue'
  }
};

export default Barbecue;

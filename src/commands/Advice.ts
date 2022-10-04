import Lists from '../utils/Lists';

const Advice: CommandModule = {
  name: 'advice',

  async handler(msg, args) {
    return Lists.advice[Math.floor(Math.random() * Lists.advice.length)];
  },

  options: {
    description: 'Some great advice!'
  }
};

export default Advice;

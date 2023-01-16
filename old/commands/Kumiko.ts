import Lists from '../utils/Lists';

const Kumiko: CommandModule = {
  name: 'kumiko',

  async handler(msg, args) {
    return {
      embed: {
        image: {
          url: Lists.kumiko[Math.floor(Math.random() * Lists.kumiko.length)]
        }
      }
    };
  },

  options: {
    description: 'Just Kumiko.'
  }
};

export default Kumiko;

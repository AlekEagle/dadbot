'use strict';

let lists = require('../functions/lists');

module.exports = {
  name: 'kumiko',

  exec: (client, msg, args) => {
    msg.channel
      .createMessage({
        embed: {
          image: {
            url: lists.kumiko[Math.floor(Math.random() * lists.kumiko.length)]
          }
        }
      })
      .catch(() => {});
  },

  options: {
    description: 'Just kumiko'
  }
};

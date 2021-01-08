'use strict';

let lists = require('../functions/lists');

module.exports = {
  name: 'advice',

  exec: (client, msg, args) => {
    msg.channel
      .createMessage(
        lists.advice[Math.floor(Math.random() * lists.advice.length)]
      )
      .catch(() => {});
  },

  options: {
    description: 'Very Good Advice!'
  }
};

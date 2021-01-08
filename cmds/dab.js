'use strict';

let lists = require('../functions/lists');

module.exports = {
  name: 'dab',

  exec: (client, msg, args) => {
    msg.channel
      .createMessage({
        embed: {
          image: {
            url:
              lists.dadsDabbing[
                Math.floor(Math.random() * lists.dadsDabbing.length)
              ]
          }
        }
      })
      .catch(() => {});
  },

  options: {
    description: 'Just dads dabbing'
  }
};

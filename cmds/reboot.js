'use strict';

let owners = require('../functions/getOwners');

module.exports = {
  name: 'reboot',

  exec: (client, msg, args) => {
    let i = 0;
    function getData() {
      return new Promise((resolve, reject) => {
        if (i === Number(process.env.NODE_APP_INSTANCE)) {
          if (++i < Number(process.env.instances)) getData().then(resolve);
          else resolve();
        } else {
          grafana
            .remoteEval(i, 'setTimeout(() => process.exit(0),500);')
            .then(() => {
              if (++i < Number(process.env.instances)) getData().then(resolve);
              else resolve();
            }, reject);
        }
      });
    }
    owners.isAdmin(msg.author.id).then(owner => {
      if (owner) {
        getData().then(() => {
          client
            .createMessage(
              msg.channel.id,
              `Alright ${msg.author.username}! Imma go take a nap!`
            )
            .then(() => {
              process.exit(0);
            });
        });
      } else
        client.createMessage(
          msg.channel.id,
          'You need the permission `BOT_ADMIN_OWNER` to use this command!'
        );
    });
  },

  options: {
    hidden: true,
    fullDescription: 'Reboots the bot (owner only command)',
    aliases: ['restart', 'reboit', 'die', 'fuckoff', 'kys']
  }
};

'use strict';

let lists = require('../functions/lists');

module.exports = {
    name: 'mio',

    exec: (client, msg, args) => {
        msg.channel.createMessage({
            embed: {
                image: {
                    url: lists.mio[Math.floor(Math.random() * lists.mio.length)]
                }
            }
        }).catch(() => { });
    },

    options: {
        description: 'Just mio'
    }
}
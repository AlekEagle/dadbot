'use strict';

let lists = require('../functions/lists');

module.exports = {
    name: 'Momjoke',

    exec: (client, msg, args) => {
            msg.channel.createMessage(lists.jokes[Math.floor(Math.random() * lists.jokes.length)]).catch(() => {});
        
    },

    options: {
        description: 'Have Mom Bot tell you a "great" joke!'
    }
}
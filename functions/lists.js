'use strict';

module.exports = {
    pastas: require('../lists.json').pastas,
    jokes: require('../lists.json').jokes,
    embarrassingThings: require('../lists.json').embarrassingThings,

    reloadlists: () => {
        delete require.cache[require.resolve(`../lists.json`)]
        module.exports.pastas = require('../lists.json').pastas;
        module.exports.jokes = require('../lists.json').jokes;
        module.exports.embarrassingThings = require('../lists.json').embarrassingThings;
    }
}
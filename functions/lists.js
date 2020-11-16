'use strict';

module.exports = {
    pastas: require('../lists.json').pastas,
    jokes: require('../lists.json').jokes,
    embarrassingThings: require('../lists.json').embarrassingThings,
    mio: require('../lists.json').mio,
    kumiko: require('../lists.json').kumiko,
    dadsDabbing: require('../lists.json').dadsDabbing,
    advice: require('../lists.json').advice,

    reloadLists: () => {
        delete require.cache[require.resolve(`../lists.json`)]
        module.exports.pastas = require('../lists.json').pastas;
        module.exports.jokes = require('../lists.json').jokes;
        module.exports.embarrassingThings = require('../lists.json').embarrassingThings;
        module.exports.mio = require('../lists.json').mio;
        module.exports.kumiko = require('../lists.json').kumiko;
        module.exports.dadsDabbing = require('../lists.json').dadsDabbing;
        module.exports.advice = require('../lists.json').advice;
    }
}
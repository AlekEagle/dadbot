'use strict';

var Map = require('collections/map');
var nums = require('../functions/numbers');

module.exports = {
    uses: new Map(),

    updateUses: (command) => {
        nums.cmdsRan ++;
        if (module.exports.uses.has(command)) {
            var temp = module.exports.uses.get(command);
            temp ++;
            module.exports.uses.delete(command);
            module.exports.uses.set(command, temp);
            return module.exports.uses.get(command);
        }
    },

    initializeCommand: (command) => {
        if (module.exports.uses.has(command)) {
            return module.exports.uses.get(command);
        }else {
            module.exports.uses.set(command, 0);
            return module.exports.uses.get(command);
        }
    }
}
'use strict';

const Logger = require('../functions/logger');
const console = new Logger();


module.exports = {
    name: 'error',

    exec: (client, err) => {
        console.error(err)
    }
}
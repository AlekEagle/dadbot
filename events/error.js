'use strict';




module.exports = {
    name: 'error',

    exec: (client, err) => {
        console.error(err)
    }
}
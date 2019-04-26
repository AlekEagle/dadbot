'use strict';

let nums = require('../functions/numbers');
const request = require('request');

module.exports = () => {
    return new Promise((resolve, reject) => {
        var guilds = 0;
        for (let thing = 0; thing < nums.shardCount; thing ++) {
            request({
                method: 'GET',
                url: `http://127.0.0.1:420${thing}/servers`
            }, (err, res, body) => {
                if (err) {
                    reject(err)
                }else {
                    guilds = guilds + parseInt(body)
                }
            })
        }
        setTimeout(() => {
            resolve(guilds)
        }, 1500)
    });
}

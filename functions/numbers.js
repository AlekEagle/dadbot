'use strict';

module.exports = {
    shardCount: process.env.DEBUG ? 1 : 51,
    cmdsRan: 0,
    msgsRead: 0,
    responses: 0
}

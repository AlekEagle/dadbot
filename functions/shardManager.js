'use strict';

const Map = require('collections/map');

class thisModule extends Map {
    connectShard(id, client) {
        this.set(id, client);
    }
    disconnectShard(id) {
        this.delete(id);
    }
}

module.exports = new thisModule();
'use strict';
const u_wut_m8 = require('../.auth.json');
const Logger = require('./logger');
const console = new Logger();
const Sequelize = require('sequelize');
const sequelize = new Sequelize(`postgres://alekeagle:${u_wut_m8.serverPass}@127.0.0.1:5432/alekeagle`, {
    logging: false
});
class Blacklist extends Sequelize.Model {};
Blacklist.init({
    type: Sequelize.INTEGER,
    userId: Sequelize.STRING
}, {
    sequelize
});
Blacklist.sync({
    force: false
}).then(() => {
    console.log('Blacklist synced to database successfully!');
}).catch(err => {
    console.error('an error occured while proforming this operation');
    console.error(err);
});
class PBlacklist extends Sequelize.Model {};
PBlacklist.init({
    userId: Sequelize.STRING
}, {
    sequelize
});
PBlacklist.sync({
    force: false
}).then(() => {
    console.log('PBlacklist synced to database successfully!');
}).catch(err => {
    console.error('an error occured while proforming this operation');
    console.error(err);
});
class GBlacklist extends Sequelize.Model {};
GBlacklist.init({
    userId: Sequelize.STRING
}, {
    sequelize
});
GBlacklist.sync({
    force: false
}).then(() => {
    console.log('GBlacklist synced to database successfully!');
}).catch(err => {
    console.error('an error occured while proforming this operation');
    console.error(err);
});

module.exports = {
    blacklist: {
        users: [],
        servers: [],
        channels: []
    },
    pblacklist: {
        servers: []
    },
    gblacklist: {
        users: []
    },

    manageBlacklist: (value) => {
        return new Promise((resolve, reject) => {
            switch (value.action) {
                case 'add':
                    switch (value.blklist) {
                        case 'blk':
                            switch (value.type) {
                                case 'user':
                                    module.exports.blacklist.users.push(value.id);
                                    Blacklist.create({
                                        type: 0,
                                        userId: value.id
                                    }).then(() => {
                                        resolve(module.exports.blacklist.users.length);
                                    }, err => {
                                        reject(err);
                                        console.error(err);
                                    });
                                break;
                                case 'server':
                                    module.exports.blacklist.servers.push(value.id);
                                    Blacklist.create({
                                        type: 1,
                                        userId: value.id
                                    }).then(() => {
                                        resolve(module.exports.blacklist.servers.length);
                                    }, err => {
                                        reject(err);
                                        console.error(err);
                                    });
                                break;
                                case 'channel':
                                    module.exports.blacklist.channels.push(value.id);
                                    Blacklist.create({
                                        type: 2,
                                        userId: value.id
                                    }).then(() => {
                                        resolve(module.exports.blacklist.channels.length);
                                    }, err => {
                                        reject(err);
                                        console.error(err);
                                    });
                                break;
                                default: 
                                    reject(`${value.type} does not exist.`);
                                break;
                            }
                        break;
                        case 'pblk':
                            module.exports.pblacklist.servers.push(value.id);
                            PBlacklist.create({
                                userId: value.id
                            }).then(() => {
                                resolve(module.exports.pblacklist.servers.length);
                            }, err => {
                                reject(err);
                                console.error(err);
                            });
                        break;
                        case 'gblk':
                            module.exports.gblacklist.users.push(value.id);
                            GBlacklist.create({
                                userId: value.id
                            }).then(() => {
                                resolve(module.exports.gblacklist.users.length);
                            }, err => {
                                reject(err);
                                console.error(err);
                            });
                        break;
                        default: 
                            reject(`${value.blklist} does not exist.`);
                        break;
                    }
                    break;
                case 'refresh':
                    switch (value.blklist) {
                        case 'blk':
                            Blacklist.findAll().then(blacklistContents => {
                                blacklistContents.forEach(e => {
                                    if (e.type === 0) module.exports.blacklist.users.push(e.userId);
                                    else if (e.type === 1) module.exports.blacklist.servers.push(e.userId);
                                    else if (e.type === 2) module.exports.blacklist.channels.push(e.userId);
                                });
                                resolve(module.exports.blacklist);
                            }, err => {
                                reject(err);
                                console.log(err);
                            });
                        break;
                        case 'pblk':
                            PBlacklist.findAll().then(pBlacklistContents => {
                                pBlacklistContents.forEach(e => {
                                    module.exports.pblacklist.servers.push(e.userId);
                                });
                                resolve(module.exports.pblacklist);
                            }, err => {
                                reject(err);
                                console.log(err);
                            });
                        break;
                        case 'gblk':
                            GBlacklist.findAll().then(gBlacklistContents => {
                                gBlacklistContents.forEach(e => {
                                    module.exports.gblacklist.users.push(e.userId);
                                });
                                resolve(module.exports.gblacklist);
                            }, err => {
                                reject(err);
                                console.log(err);
                            });
                        break;
                        default: 
                            reject(`${value.blklist} does not exist.`);
                        break;
                    }
                    break;
                case 'remove':
                    switch (value.blklist) {
                        case 'blk':
                            switch (value.type) {
                                case 'user':
                                    module.exports.blacklist.users = module.exports.blacklist.users.filter(u => u !== value.id)
                                    Blacklist.findOne({
                                        where: {
                                            type: 0,
                                            userId: value.id
                                        }
                                    }).then(user => {
                                        user.destroy().then(() => {
                                            resolve(module.exports.blacklist.users.length);
                                        })
                                    }, err => {
                                        reject(err);
                                        console.log(err);
                                    });
                                break;
                                case 'server':
                                    module.exports.blacklist.servers = module.exports.blacklist.servers.filter(u => u !== value.id)
                                    Blacklist.findOne({
                                        where: {
                                            type: 1,
                                            userId: value.id
                                        }
                                    }).then(user => {
                                        user.destroy().then(() => {
                                            resolve(module.exports.blacklist.servers.length);
                                        })
                                    }, err => {
                                        reject(err);
                                        console.log(err);
                                    });
                                break;
                                case 'channel':
                                    module.exports.blacklist.channels = module.exports.blacklist.channels.filter(u => u !== value.id)
                                    Blacklist.findOne({
                                        where: {
                                            type: 2,
                                            userId: value.id
                                        }
                                    }).then(user => {
                                        user.destroy().then(() => {
                                            resolve(module.exports.blacklist.channels.length);
                                        })
                                    }, err => {
                                        reject(err);
                                        console.log(err);
                                    });
                                break;
                                default: 
                                    reject(`${value.type} does not exist.`);
                                break;
                            }
                        break;
                        case 'pblk':
                            module.exports.pblacklist.servers = module.exports.pblacklist.servers.filter(u => u !== value.id)
                            PBlacklist.findOne({
                                where: {
                                    userId: value.id
                                }
                            }).then(user => {
                                user.destroy().then(() => {
                                    resolve(module.exports.pblacklist.servers.length);
                                })
                            }, err => {
                                reject(err);
                                console.log(err);
                            });
                        break;
                        case 'gblk':
                            module.exports.gblacklist.users = module.exports.gblacklist.users.filter(u => u !== value.id)
                            GBlacklist.findOne({
                                where: {
                                    userId: value.id
                                }
                            }).then(user => {
                                user.destroy().then(() => {
                                    resolve(module.exports.gblacklist.users.length);
                                })
                            }, err => {
                                reject(err);
                                console.log(err);
                            });
                        break;
                        default: 
                            reject(`${value.blklist} does not exist.`);
                        break;
                    }
                break;
                default: 
                    reject(`${value.action} does not exist.`);
                break;
            }
        });
    }
}
'use strict';

const fs = require('fs');

module.exports = {
    blacklist: {users: [], servers: []},
    pblacklist: {servers: []},
    gblacklist: {users: []},

    manageBlacklist: (value) => {
        return new Promise((resolve, reject) => {
            switch (value.action) {
                case 'add':
                    switch (value.blklist) {
                        case 'blk':
                            switch (value.type) {
                                case 'user':
                                    module.exports.blacklist.users.push(value.id)
                                    fs.writeFile('./blacklist.blk', JSON.stringify(module.exports.blacklist), err => {
                                        if (err) {
                                            reject(err);
                                        }else {
                                            resolve(module.exports.blacklist.users.length);
                                        }
                                    });
                                break;
                                case 'server':
                                    module.exports.blacklist.servers.push(value.id)
                                    fs.writeFile('./blacklist.blk', JSON.stringify(module.exports.blacklist), err => {
                                        if (err) {
                                            reject(err);
                                        }else {
                                            resolve(module.exports.blacklist.servers.length);
                                        }
                                    });
                                break;
                            }
                        break;
                        case 'pblk':
                            module.exports.pblacklist.servers.push(value.id)
                            fs.writeFile('./pblacklist.blk', JSON.stringify(module.exports.pblacklist), err => {
                                if (err) {
                                    reject(err);
                                }else {
                                    resolve(module.exports.pblacklist.servers.length);
                                }
                            });
                        break;
                        case 'gblk':
                            module.exports.gblacklist.users.push(value.id)
                            fs.writeFile('./gblacklist.blk', JSON.stringify(module.exports.gblacklist), err => {
                                if (err) {
                                    reject(err);
                                }else {
                                    resolve(module.exports.gblacklist.users.length);
                                }
                            });
                        break;
                    }
                break;
                case 'refresh':
                    switch (value.blklist) {
                        case 'blk':
                            fs.readFile('./blacklist.blk', (err, data) => {
                                if (err) {
                                    reject(err);
                                }else {
                                    data = JSON.parse(data.toString());
                                    module.exports.blacklist = data;
                                    resolve(module.exports.blacklist);
                                }
                            });
                        break;
                        case 'pblk':
                            fs.readFile('./pblacklist.blk', (err, data) => {
                                if (err) {
                                    reject(err);
                                }else {
                                    data = JSON.parse(data.toString());
                                    module.exports.pblacklist = data;
                                    resolve(module.exports.pblacklist);
                                }
                            });
                        break;
                        case 'gblk':
                            fs.readFile('./gblacklist.blk', (err, data) => {
                                if (err) {
                                    reject(err);
                                }else {
                                    data = JSON.parse(data.toString());
                                    module.exports.gblacklist = data;
                                    resolve(module.exports.gblacklist);
                                }
                            });
                        break;
                    }
                break;
                case 'remove':
                    switch (value.blklist) {
                        case 'blk':
                            switch (value.type) {
                                case 'user':
                                    module.exports.blacklist.users = module.exports.blacklist.users.filter(u => u !== value.id)
                                    fs.writeFile('./blacklist.blk', JSON.stringify(module.exports.blacklist), err => {
                                        if (err) {
                                            reject(err);
                                        }else {
                                            module.exports.manageBlacklist({action: 'refresh', blklist: 'blk'}).then(() => {
                                                resolve(module.exports.blacklist.users.length);
                                            }, (err) => {
                                                reject(err);
                                            });
                                        }
                                    });
                                break;
                                case 'server':
                                    module.exports.blacklist.servers = module.exports.blacklist.servers.filter(u => u !== value.id)
                                    fs.writeFile('./blacklist.blk', JSON.stringify(module.exports.blacklist), err => {
                                        if (err) {
                                            reject(err);
                                        }else {
                                            module.exports.manageBlacklist({action: 'refresh', blklist: 'blk'}).then(() => {
                                                resolve(module.exports.blacklist.servers.length);
                                            }, (err) => {
                                                reject(err);
                                            });
                                        }
                                    });
                                break;
                            }
                        break;
                        case 'pblk': 
                            module.exports.pblacklist.servers = module.exports.pblacklist.servers.filter(u => u !== value.id)
                            fs.writeFile('./pblacklist.blk', JSON.stringify(module.exports.pblacklist), err => {
                                if (err) {
                                    reject(err);
                                }else {
                                    module.exports.manageBlacklist({action: 'refresh', blklist: 'pblk'}).then(() => {
                                        resolve(module.exports.pblacklist.servers.length);
                                    }, (err) => {
                                        reject(err);
                                    });
                                }
                            });
                        break;
                        case 'gblk': 
                            module.exports.gblacklist.users = module.exports.gblacklist.users.filter(u => u !== value.id)
                            fs.writeFile('./gblacklist.blk', JSON.stringify(module.exports.gblacklist), err => {
                                if (err) {
                                    reject(err);
                                }else {
                                    module.exports.manageBlacklist({action: 'refresh', blklist: 'gblk'}).then(() => {
                                        resolve(module.exports.gblacklist.users.length);
                                    }, (err) => {
                                        reject(err);
                                    });
                                }
                            });
                        break;
                    }
                break;
            }
        });
    }
}
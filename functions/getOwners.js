'use strict';

const fs = require('fs')

module.exports = {
    owners: {users: []},
    
    isOwner: (id) => {
        return module.exports.owners.users.map(e => e.id).includes(id);
    },

    isAdminOwner: (id) => {
        return module.exports.owners.users.filter(e => e.id === id)[0] ? module.exports.owners.users.filter(e => e.id === id)[0].adminOwner : false;
    },

    addOwner: (id, isAdminOwner, functionCaller) => {
        return new Promise((resolve, reject) => {
            module.exports.owners.users.push({
                id: id,
                adminOwner: module.exports.isAdminOwner(functionCaller) ? JSON.parse(isAdminOwner) : false
            });
            fs.writeFile('./owners.json', JSON.stringify(module.exports.owners), err => {
                if (err) {
                    reject(err);
                }else {
                    resolve(module.exports.owners.users.filter(e => e.id === id)[0]);
                }
            });
        });
    },

    removeOwner: (id, functionCaller) => {
        return new Promise((resolve, reject) => {
            if (module.exports.isAdminOwner(id) && module.exports.isAdminOwner(functionCaller) || !module.exports.isAdminOwner(id)){
                module.exports.owners.users = module.exports.owners.users.filter(u => u.id !== id);
                fs.writeFile('./owners.json', JSON.stringify(module.exports.owners), err => {
                    if (err) {
                        reject(err);
                    }else {
                        module.exports.initializeOwners().then(() => {
                            resolve(module.exports.owners.users.length);
                        }, (err) => {
                            reject(err);
                        });
                    }
                });
            }else reject(new Error('functionCaller doesn\'t have permissions to affect other owner'))
        });
    },

    initializeOwners: () => {
        return new Promise((resolve, reject) => {
            fs.readFile('./owners.json', (err, data) => {
                if (err) {
                    reject(err);
                }else {
                    data = JSON.parse(data.toString());
                    module.exports.owners = data;
                    resolve(module.exports.owners);
                }
            });
        });
    }
}
'use strict';

const Sequelize = require("sequelize");

class Owners extends Sequelize.Model { }
Owners.init(
    {
        id: { type: Sequelize.STRING, primaryKey: true },
        admin: Sequelize.BOOLEAN,
    },
    { sequelize: _database }
);
Owners.sync({
    force: false,
})
    .then(() => {
        console.info("Owners synced to database successfully!");
    })
    .catch((err) => {
        console.error("an error occured while proforming this operation", err);
    });

module.exports = {
    Owners,

    isOwner: (id) => {
        return new Promise((resolve, reject) => {
            module.exports.Owners.findOne({ where: { id } }).then(users => {
                resolve(!!users);
            }, err => reject(err));
        });
    },

    isAdmin: (id) => {
        return new Promise((resolve, reject) => {
            module.exports.Owners.findOne({ where: { id, admin: true } }).then(users => {
                resolve(!!users);
            }, err => reject(err));
        });
    },

    addOwner: (id, isAdmin, functionCaller) => {
        return module.exports.Owners.create({
            id: id,
            admin: module.exports.isAdmin(functionCaller) ? JSON.parse(isAdmin) : false
        });
    },

    removeOwner: (id, functionCaller) => {
        return new Promise((resolve, reject) => {
            if (module.exports.isAdmin(id) && module.exports.isAdmin(functionCaller) || !module.exports.isAdmin(id)) {
                module.exports.owners.users = module.exports.owners.users.filter(u => u.id !== id);
                fs.writeFile('./owners.json', JSON.stringify(module.exports.owners), err => {
                    if (err) {
                        reject(err);
                    } else {
                        module.exports.initializeOwners().then(() => {
                            resolve(module.exports.owners.users.length);
                        }, (err) => {
                            reject(err);
                        });
                    }
                });
            } else reject(new Error('functionCaller doesn\'t have permissions to affect other owner'))
        });
    }
}
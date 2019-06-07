'use strict';

const EventEmitter = require('events').EventEmitter;
const u_wut_m8 = require('../.auth.json');
const Logger = require('./logger');
const console = new Logger();
const Sequelize = require('sequelize');
const sequelize = new Sequelize(`postgres://alekeagle:${u_wut_m8.serverPass}@127.0.0.1:5432/alekeagle`, {
    logging: false
});
class Prefixes extends Sequelize.Model {};
Prefixes.init({
    serverID: Sequelize.STRING,
    prefix: Sequelize.STRING
}, { sequelize });
Prefixes.sync({
    force: false
}).then(() => {
    console.log('Prefixes synced to database successfully!');
}).catch(err => {
    console.error('an error occured while proforming this operation');
    console.error(err);
});
class thisModule extends EventEmitter {
    managePrefixes(value) {
        return new Promise((resolve, reject) => {
            switch (value.action) {
                case 'add':
                    Prefixes.findOne({
                        where: {
                            serverID: value.serverID
                        }
                    }).then(prefix => {
                        if (prefix) {
                            prefix.update({prefix: value.prefix}).then(p => {
                                this.emit('updatePrefix', p.serverID, p.prefix);
                                resolve();
                            }, err => {
                                console.error(err);
                                reject(err);
                            })
                        }else {
                            Prefixes.create({
                                serverID: value.serverID,
                                prefix: value.prefix
                            }).then(prefix => {
                                this.emit('newPrefix', prefix.serverID, prefix.prefix);
                                resolve();
                            }, err => {
                                console.error(err);
                                reject(err);
                            });
                        }
                    }, err => {
                        console.error(err);
                        reject(err);
                    });
                break;
                case 'refresh':
                    Prefixes.findAll().then(prefixes => {
                        prefixes.forEach(p => {
                            value.client.registerGuildPrefix(p.serverID, p.prefix);
                        });
                        resolve(prefixes);
                    }, err => {
                        console.error(err);
                        reject(err);
                    });
                break;
                case 'remove':
                    Prefixes.findOne({
                        where: {
                            serverID: value.serverID
                        }
                    }).then(prefix => {
                        if (prefix) {
                            prefix.destroy().then(() => {
                                this.emit('removePrefix', value.serverID);
                                resolve();
                            }, err => {
                                console.error(err);
                                reject(err);
                            });
                        }else {
                            resolve();
                        }
                    }, err => {
                        console.error(err);
                        reject(err);
                    })
                break;
                default: 
                    reject(`${value.action} does not exist.`);
                break;
            }
        })
    }
}

module.exports = new thisModule();
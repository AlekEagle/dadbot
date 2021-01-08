'use strict';

const Sequelize = require('sequelize');

class Owners extends Sequelize.Model {}
Owners.init(
  {
    id: { type: Sequelize.STRING, primaryKey: true },
    admin: Sequelize.BOOLEAN
  },
  { sequelize: _database }
);
Owners.sync({
  force: false
})
  .then(() => {
    console.info('Owners synced to database successfully!');
  })
  .catch(err => {
    console.error('an error occured while proforming this operation', err);
  });

module.exports = {
  Owners,

  isOwner: async id => {
    try {
      return !!(await module.exports.Owners.findOne({ where: { id } }));
    } catch (err) {
      throw err;
    }
  },

  isAdmin: async id => {
    try {
      return !!(await module.exports.Owners.findOne({
        where: { id, admin: true }
      }));
    } catch (err) {
      throw err;
    }
  },

  addOwner: async (id, isAdmin, functionCaller) => {
    return module.exports.Owners.create({
      id: id,
      admin: module.exports.isAdmin(functionCaller)
        ? JSON.parse(isAdmin)
        : false
    });
  },

  removeOwner: async (id, functionCaller) => {
    let affected = await module.exports.isAdmin(id),
      affecter = await module.exports.isAdmin(functionCaller);
    if ((affected && affecter) || !affected) {
      let affectedObj = await module.exports.Owners.findOne({
        where: {
          id
        }
      });
      if (affectedObj) return affectedObj.destroy();
    } else
      throw new Error(
        "functionCaller doesn't have permissions to affect other owner"
      );
  }
};

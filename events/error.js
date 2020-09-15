'use strict';

const Sequelize = require('sequelize');
class WSErrors extends Sequelize.Model {};
WSErrors.init(
  {
    error: Sequelize.DataTypes.STRING(10485760),
    admin: Sequelize.BOOLEAN,
  },
  { sequelize: _database }
);
WSErrors.sync({
  force: false,
})
  .then(() => {
    console.info("WSErrors synced to database successfully!");
  })
  .catch((err) => {
    console.error("an error occured while proforming this operation", err);
  });


module.exports = {
    name: 'error',

    exec: (client, err) => {
        console.error(err);
        WSErrors.create({error: require('util').inspect(err)});
    }
}
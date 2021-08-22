import { sequelize, init as initDB } from '.';
import { Model, DataTypes } from 'sequelize';

initDB();

export default class Prefixes extends Model {
  serverID: string;
  prefix: string;
}

Prefixes.init(
  {
    serverID: { type: DataTypes.STRING, primaryKey: true },
    prefix: DataTypes.STRING
  },
  {
    sequelize
  }
);

Prefixes.sync({ alter: true }).then(
  () => {
    console.info('Synced Prefixes successfully!');
  },
  err => {
    console.error('Unable to sync Prefixes! Error: ', err);
  }
);

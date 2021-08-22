import { sequelize, init as initDB } from '.';
import { Model, DataTypes } from 'sequelize';

initDB();

export default class GlobalBlacklist extends Model {
  id: string;
  cmds: string[];
}

GlobalBlacklist.init(
  {
    id: { type: DataTypes.STRING, primaryKey: true },
    cmds: DataTypes.ARRAY(DataTypes.STRING)
  },
  {
    sequelize
  }
);

GlobalBlacklist.sync({ alter: true }).then(
  () => {
    console.info('Synced GlobalBlacklist successfully!');
  },
  err => {
    console.error('Unable to sync GlobalBlacklist! Error: ', err);
  }
);

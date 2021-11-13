import { sequelize, init as initDB } from '.';
import { Model, DataTypes } from 'sequelize';

export default class GlobalBlacklist extends Model {
  id: string;
  cmds: string[];
}

(async function () {
  await initDB();
  GlobalBlacklist.init(
    {
      id: { type: DataTypes.STRING, primaryKey: true },
      cmds: DataTypes.ARRAY(DataTypes.STRING)
    },
    {
      sequelize
    }
  );

  GlobalBlacklist.sync().then(
    () => {
      console.info('Synced GlobalBlacklist successfully!');
    },
    err => {
      console.error('Unable to sync GlobalBlacklist! Error: ', err);
    }
  );
})();

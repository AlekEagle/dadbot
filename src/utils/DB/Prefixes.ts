import { sequelize, init as initDB } from '.';
import { Model, DataTypes } from 'sequelize';

export default class Prefixes extends Model {
  serverID: string;
  prefix: string;
}

(async function () {
  await initDB();
  Prefixes.init(
    {
      serverID: { type: DataTypes.STRING, primaryKey: true },
      prefix: DataTypes.STRING
    },
    {
      sequelize
    }
  );

  Prefixes.sync().then(
    () => {
      console.info('Synced Prefixes successfully!');
    },
    err => {
      console.error('Unable to sync Prefixes! Error: ', err);
    }
  );
})();

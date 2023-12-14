import { sequelize, init as initDB } from '.';
import { Model, DataTypes } from 'sequelize';

export default class Prefixes extends Model {
  declare serverID: string;
  prefix: string;
}

(async function () {
  await initDB();
  Prefixes.init(
    {
      serverID: { type: DataTypes.STRING, primaryKey: true },
      prefix: DataTypes.STRING,
    },
    {
      sequelize,
    },
  );

  Prefixes.sync().then(
    () => {},
    (err) => {
      console.error('Unable to sync Prefixes! Error: ', err);
    },
  );
})();

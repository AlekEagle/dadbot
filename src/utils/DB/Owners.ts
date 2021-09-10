import { sequelize, init as initDB } from '.';
import { Model, DataTypes } from 'sequelize';

export default class Owners extends Model {
  id: string;
  admin: boolean;
}

(async function () {
  await initDB();
  Owners.init(
    {
      id: { type: DataTypes.STRING, primaryKey: true },
      admin: DataTypes.BOOLEAN
    },
    {
      sequelize
    }
  );

  Owners.sync().then(
    () => {
      console.info('Synced Owners successfully!');
    },
    err => {
      console.error('Unable to sync Owners! Error: ', err);
    }
  );
})();
import { sequelize, init as initDB } from '.';
import { Model, DataTypes } from 'sequelize';

export default class Options extends Model {
  id: string;
  flags: number;
  RNG: number;
}

(async function () {
  await initDB();
  Options.init(
    {
      id: { type: DataTypes.STRING, primaryKey: true },
      flags: DataTypes.SMALLINT,
      RNG: DataTypes.FLOAT
    },
    {
      sequelize
    }
  );

  Options.sync().then(
    () => {
      console.info('Synced Options successfully!');
    },
    err => {
      console.error('Unable to sync Options! Error: ', err);
    }
  );
})();

import { sequelize, init as initDB } from '.';
import { Model, DataTypes } from 'sequelize';

export default class Options extends Model {
  declare id: string;
  declare flags: number;
  declare RNG: number;
}

(async function () {
  await initDB();
  Options.init(
    {
      id: { type: DataTypes.STRING, primaryKey: true },
      flags: DataTypes.SMALLINT,
      RNG: DataTypes.FLOAT,
    },
    {
      sequelize,
    },
  );

  Options.sync().then(
    () => {},
    (err) => {
      console.error('Unable to sync Options! Error: ', err);
    },
  );
})();

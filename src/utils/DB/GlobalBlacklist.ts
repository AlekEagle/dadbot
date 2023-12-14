import { sequelize, init as initDB } from '.';
import { Model, DataTypes } from 'sequelize';

export default class GlobalBlacklist extends Model {
  declare id: string;
  declare cmds: string[];
}

(async function () {
  await initDB();
  GlobalBlacklist.init(
    {
      id: { type: DataTypes.STRING, primaryKey: true },
      cmds: DataTypes.ARRAY(DataTypes.STRING),
    },
    {
      sequelize,
    },
  );

  GlobalBlacklist.sync().then(
    () => {},
    (err) => {
      console.error('Unable to sync GlobalBlacklist! Error: ', err);
    },
  );
})();

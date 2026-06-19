import { sequelize, init as initDB } from '.';
import { Model, DataTypes } from 'sequelize';

export default class Owners extends Model {
  declare id: string;
  declare admin: boolean;
}

(async function () {
  await initDB();
  Owners.init(
    {
      id: { type: DataTypes.STRING, primaryKey: true },
      admin: DataTypes.BOOLEAN,
    },
    {
      sequelize,
    },
  );

  try {
    await Owners.sync();
  } catch (e) {
    console.error('Unable to sync Owners! Error:', e);
  }
})();

import { sequelize, init as initDB } from '.';
import { Model, DataTypes } from 'sequelize';

export default class BrownMe extends Model {
  declare id: string;
  declare roleID: string;
}

(async function () {
  await initDB();
  BrownMe.init(
    {
      id: { type: DataTypes.STRING, primaryKey: true },
      roleID: { type: DataTypes.STRING },
    },
    {
      sequelize,
    },
  );

  try {
    await BrownMe.sync();
  } catch (e) {
    console.error('Unable to sync BrownMe! Error:', e);
  }
})();

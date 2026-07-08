import { sequelize, init as initDB } from '.';
import { Model, DataTypes } from 'sequelize';

export default class FeatureOptOut extends Model {
  declare id: string;
  declare feature: number;
}

(async function () {
  await initDB();
  FeatureOptOut.init(
    {
      id: { type: DataTypes.STRING, primaryKey: true },
      feature: { type: DataTypes.SMALLINT },
    },
    {
      sequelize,
    },
  );

  try {
    await FeatureOptOut.sync();
  } catch (e) {
    console.error('Unable to sync FeatureOptOut! Error:', e);
  }
})();

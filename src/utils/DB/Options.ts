import { sequelize, init as initDB } from '.';
import { Model, DataTypes } from 'sequelize';

initDB();

export default class Options extends Model {
  id: string;
  flags: number;
  RNG: number;
}

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

Options.sync({ alter: true }).then(
  () => {
    console.info('Synced Options successfully!');
  },
  err => {
    console.error('Unable to sync Options! Error: ', err);
  }
);

import { Sequelize } from 'sequelize';
import dotenvConfig from '../dotenv';

export let sequelize: Sequelize = null;

export async function init() {
  await dotenvConfig();
  if (!sequelize) {
    sequelize = new Sequelize(
      'alekeagle',
      'alekeagle',
      process.env.serverPass,
      {
        host: 'localhost',
        dialect: 'postgres',
        logging: false
      }
    );
    if (!(await testConnection())) throw 'Connection Failed.';
    return true;
  }
  return false;
}

export async function testConnection() {
  try {
    await sequelize.authenticate();
    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
}

export default {
  init,
  sequelize,
  testConnection
};

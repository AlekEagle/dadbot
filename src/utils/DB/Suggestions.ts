import { sequelize, init as initDB } from '.';
import { Model, DataTypes } from 'sequelize';

initDB();

export default class Suggestions extends Model {
  userID: string;
}

Suggestions.init(
  {
    userID: { type: DataTypes.STRING, allowNull: false },
    type: { type: DataTypes.SMALLINT, allowNull: false },
    guildID: { type: DataTypes.STRING, allowNull: true },
    channelID: { type: DataTypes.STRING, allowNull: false },
    messageID: { type: DataTypes.STRING, allowNull: false, primaryKey: true },
    content: { type: DataTypes.STRING(4000), allowNull: false },
    attachments: { type: DataTypes.JSON, allowNull: true },
    replies: { type: DataTypes.JSON, allowNull: false, defaultValue: [] },
    id: { type: DataTypes.INTEGER, unique: true, autoIncrement: true },
    suggestionMsgID: { type: DataTypes.STRING, allowNull: true }
  },
  {
    sequelize
  }
);

Suggestions.sync({ alter: true }).then(
  () => {
    console.info('Synced Suggestions successfully!');
  },
  err => {
    console.error('Unable to sync Suggestions! Error: ', err);
  }
);

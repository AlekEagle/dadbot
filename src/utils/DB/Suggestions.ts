import { sequelize, init as initDB } from ".";
import { Model, DataTypes } from "sequelize";

export default class Suggestions extends Model {
  declare userID: string;
  declare type: number;
  declare guildID: string;
  declare channelID: string;
  declare messageID: string;
  declare content: string;
  declare attachments: {
    filename: string;
    url: string;
  }[];
  declare replies: { replied: string; content: string; at: Date }[];
  declare id: number;
  declare suggestionMsgID: string;
  declare createdAt: Date;
  declare updatedAt: Date;
}
(async function () {
  await initDB();
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
      suggestionMsgID: { type: DataTypes.STRING, allowNull: true },
    },
    {
      sequelize,
    }
  );

  Suggestions.sync().then(
    () => {},
    (err) => {
      console.error("Unable to sync Suggestions! Error: ", err);
    }
  );
})();

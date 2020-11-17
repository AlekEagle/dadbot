'use strict';

const Sequelize = require("sequelize"),
    channels = {
        complaint: '690286309461196912',
        compliment: '690286380122767481',
        suggestion: '690299278702149712'
    };

class Suggestions extends Sequelize.Model { };

Suggestions.init({
    userID: { type: Sequelize.STRING, allowNull: false },
    type: { type: Sequelize.SMALLINT, allowNull: false },
    guildID: { type: Sequelize.STRING, allowNull: true },
    channelID: { type: Sequelize.STRING, allowNull: false },
    messageID: { type: Sequelize.STRING, allowNull: false, primaryKey: true },
    content: { type: Sequelize.STRING(2000), allowNull: false },
    attachments: { type: Sequelize.JSON, allowNull: true },
    replies: { type: Sequelize.JSON, allowNull: true },
    id: { type: Sequelize.INTEGER, unique: true, autoIncrement: true },
    suggestionMsgID: { type: Sequelize.STRING, allowNull: true }
}, {
    sequelize: _database
});
Suggestions.sync({ force: true })
    .then(() => {
        console.info("Suggestions synced to database successfully!");
    })
    .catch((err) => {
        console.error("an error occured while proforming this operation", err);
    });

async function sendSuggestion(type, message, suggestion) {
    let msg = await message._client.createMessage(Object.values(channels)[type], {
        embed: {
            title: `New ${Object.keys(channels)[type].substr(0, 1).toUpperCase() + Object.keys(channels)[type].substr(1, Object.keys(channels)[type].length)} | #${suggestion.id}`,
            author: {
                name: `${message.author.username}#${message.author.discriminator} (${message.author.id})`,
                icon_url: message.author.dynamicAvatarURL('png', 512).split('?')[0]
            },
            description: suggestion.content,
            fields: [
                {
                    name: 'Shard',
                    value: message.channel.guild ? message.channel.guild.shard.id : 0,
                    inline: true
                }, {
                    name: 'User',
                    value: `${message.author.username}#${message.author.discriminator} \`<${message.author.id}>\``,
                    inline: true
                }, {
                    name: 'Guild',
                    value: message.channel.guild ? `\`${message.channel.guild.name} <${message.channel.guild.id}>\`` : '`Private Message <N/A>\`',
                    inline: true
                }, {
                    name: 'Channel',
                    value: message.channel.guild ? `\`${message.channel.name} <${message.channel.id}>\`` : `\`Private Message <${message.channel.id}>\``,
                    inline: true
                }, {
                    name: 'Time',
                    value: new Date(message.timestamp).toUTCString(),
                    inline: true
                },
                {
                    name: 'Attachments',
                    value: suggestion.attachments ? suggestion.attachments.map(s => `[${s.filename}](${s.url})`).join('\n') : 'None'
                }
            ]
        }
    });
    await suggestion.update({ suggestionMsgID: msg.id });
    return msg;
}

module.exports = {
    Suggestions,

    channels,

    async create(type, message, content) {
        let suggestion;
        try {
            suggestion = await Suggestions.create({ type, userID: message.author.id, messageID: message.id, channelID: message.channel.id, guildID: message.channel.guild ? message.channel.guild.id : null, content, attachments: message.attachments.length > 0 ? message.attachments : null });
        } catch (e) {
            throw e;
        }
        await sendSuggestion(type, message, suggestion);
        return await Suggestions.findOne({
            where: {
                id: suggestion.id
            }
        });
    },

    async reply(id, message, content) {
        let suggestion;
        try {
            suggestion = await Suggestions.findOne({
                where: {
                    id
                }
            });
        } catch (e) {
            throw e;
        }
        if (suggestion === null) throw new Error('Suggestion with that ID does not exist');
        message._client.createMessage(suggestion.channelID, `Hey <@${suggestion.userID}>! Your ${Object.keys(channels)[suggestion.type]} (linked here for reference 👉 <https://canary.discord.com/channels/${suggestion.guildID || '@me'}/${suggestion.channelID}/${suggestion.messageID}>​) got a reply from the Dad Bot Crew! Here's what they said: \n\`${content}\``);
        return await suggestion.update({ replies: suggestion.replies ? [...suggestion.replies, { replied: message.author.id, content, at: message.createdAt }] : [{ replied: message.author.id, content, at: message.createdAt }] });
    },

    // Inline reply implementation of replying to suggestions.
    /* async reply(id, message, content) {
        let suggestion;
        try {
            suggestion = await Suggestions.findOne({
                where: {
                    id
                }
            });
        } catch (e) {
            throw e;
        }
        if (suggestion === null) throw new Error('Suggestion with that ID does not exist');
        message._client.createMessage(suggestion.channelID, { content: `Hey! Your ${Object.keys(channels)[suggestion.type]} got a reply from the Dad Bot Crew! Here's what they said: \n\`${content}\``, messageReference: { channelID: suggestion.channelID, guildID: suggestion.guildID, messageID: suggestion.messageID }, allowedMentions: { repliedUser: !!suggestion.guildID } });
        return await suggestion.update({ replies: suggestion.replies ? [...suggestion.replies, { replied: message.author.id, content, at: message.createdAt }] : [{ replied: message.author.id, content, at: message.createdAt }] });
    }, */

    async delete(id, client) {
        let suggestion;
        try {
            suggestion = await Suggestions.findOne({
                where: {
                    id
                }
            });
        } catch (e) {
            throw e;
        }
        if (suggestion === null) throw new Error('Suggestion with that ID does not exist');
        await client.deleteMessage(Object.values(channels)[suggestion.type], suggestion.suggestionMsgID);
        await suggestion.destroy();
        return suggestion;
    }
}
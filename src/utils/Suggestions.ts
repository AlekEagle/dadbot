import Eris from 'eris';
import ECH from 'eris-command-handler';
import Suggestions from './DB/Suggestions';

const channels = {
  complaint: '690286309461196912',
  compliment: '690286380122767481',
  suggestion: '690299278702149712'
};

function capitalize(str: string) {
  return str.substr(0, 1).toUpperCase() + str.substr(1);
}

async function sendSuggestion<A extends keyof typeof channels>(
  type: A,
  msg: Eris.Message,
  suggestion: Suggestions
) {
  let channelTypes = Object.keys(channels);
  if (!channelTypes.includes(type as string))
    throw new Error('Suggestion type does not exist');
  let suggestionMsg = await msg.channel.client.createMessage(channels[type], {
    embed: {
      title: `New ${capitalize(type as string)} | #${suggestion.id}`,
      author: {
        name: `${msg.author.username}#${msg.author.discriminator} (${msg.author.id})`,
        icon_url: msg.author.dynamicAvatarURL('png', 4096)
      },
      description: suggestion.content,
      fields: [
        {
          name: 'Shard',
          value: (msg.channel as Eris.GuildTextableChannel).guild
            ? (
                msg.channel as Eris.GuildTextableChannel
              ).guild.shard.id.toString()
            : '0',
          inline: true
        },
        {
          name: 'User',
          value: `${msg.author.username}#${msg.author.discriminator} \`<${msg.author.id}>\``,
          inline: true
        },
        {
          name: 'Guild',
          value: `\`${
            (msg.channel as Eris.GuildTextableChannel).guild
              ? `${(msg.channel as Eris.GuildTextableChannel).guild.name} <${
                  (msg.channel as Eris.GuildTextableChannel).guild.id
                }>`
              : `Private Message <N/A>`
          }\``,
          inline: true
        },
        {
          name: 'Channel',
          value: `\`${
            (msg.channel as Eris.GuildTextableChannel).guild
              ? `${(msg.channel as Eris.GuildTextableChannel).name} <${
                  (msg.channel as Eris.GuildTextableChannel).id
                }>`
              : `Private Message <${msg.channel.id}>`
          }\``,
          inline: true
        },
        {
          name: 'Attachments',
          value: suggestion.attachments
            ? suggestion.attachments
                .map(a => `[${a.filename}](${a.url})`)
                .join('\n')
            : 'None',
          inline: true
        }
      ],
      timestamp: suggestion.createdAt.toISOString()
    }
  });
  await suggestion.update({ suggestionMsgID: suggestionMsg.id });
  return suggestionMsg;
}

export default {
  channels,

  async create<A extends keyof typeof channels>(
    type: A,
    message: Eris.Message,
    content: string
  ) {
    let suggestion: Suggestions;
    try {
      suggestion = await Suggestions.create({
        type: Object.keys(channels).indexOf(type as string),
        userID: message.author.id,
        messageID: message.id,
        channelID: message.channel.id,
        guildID: (message.channel as Eris.GuildTextableChannel).guild
          ? (message.channel as Eris.GuildTextableChannel).guild.id
          : null,
        content,
        attachments: message.attachments.length > 0 ? message.attachments : null
      });
    } catch (error) {
      throw error;
    }
    await sendSuggestion(type, message, suggestion);
    return await Suggestions.findOne({
      where: {
        id: suggestion.id
      }
    });
  },

  async reply(id: string, message: Eris.Message, content: string) {
    let suggestion: Suggestions;
    try {
      suggestion = await Suggestions.findOne({
        where: {
          id
        }
      });
    } catch (e) {
      throw e;
    }
    if (suggestion === null)
      throw new Error('Suggestion with that ID does not exist.');
    await message.channel.client.createMessage(suggestion.channelID, {
      messageReference: {
        messageID: suggestion.messageID,
        channelID: suggestion.channelID,
        guildID: suggestion.guildID
      },
      allowedMentions: { repliedUser: true },
      content: `Hey! Your ${
        Object.keys(channels)[suggestion.type]
      } got a reply from the Dad Bot Crew! Here's what they said: \n\`${content}\``
    });
    return await suggestion.update({
      replies: suggestion.replies
        ? [
            ...suggestion.replies,
            {
              replied: message.author.id,
              content,
              at: message.createdAt
            }
          ]
        : [
            {
              replied: message.author.id,
              content,
              at: message.createdAt
            }
          ]
    });
  },

  async get(id: string) {
    let suggestion: Suggestions;
    try {
      suggestion = await Suggestions.findOne({
        where: {
          id
        }
      });
    } catch (e) {
      throw e;
    }

    return suggestion;
  },

  async delete(id: string, client: ECH.CommandClient) {
    let suggestion: Suggestions;
    try {
      suggestion = await Suggestions.findOne({
        where: {
          id
        }
      });
    } catch (e) {
      throw e;
    }
    if (suggestion === null)
      throw new Error('Suggestion with that ID does not exist.');
    try {
      await client.deleteMessage(
        Object.values(channels)[suggestion.type],
        suggestion.suggestionMsgID
      );
    } catch (e) {
      console.warn('Message probably already deleted.', e);
    }
    await suggestion.destroy();
    return suggestion;
  }
};

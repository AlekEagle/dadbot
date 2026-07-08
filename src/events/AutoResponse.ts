import { checkBlacklistStatus } from '../utils/Blacklist';
import {
  Flags,
  SettingsConfigObject,
  getComputedSettings,
} from '../utils/Settings';
import { Message, ThreadChannel } from 'oceanic.js';
import { readFile } from 'node:fs/promises';
import { incrementMsgCount, incrementResponseCount } from '../utils/Statistics';
import Dadhook from '../utils/Dadhook';
import Lists from '../utils/Lists';

// i made this before realizing i'm trying to boil the ocean (i'm always trying to boil the ocean)
// k+i+l+[\W_]*(?:y+o+u+'*r*'*e*|u+r+e*)[\W_]*s+e+l+f+|k+(?:i+l+)?[\W_]+(?:y+(?:o+u+'*r*'*e*)?|u+r+e*)[\W_]*s+(?:e+l+f+)?|k+(?:i+l+)?[\W_]*(?:y+(?:o+u+'*r*'*e*)?|u+r+e*)[\W_]+s+(?:e+l+f+)?|\bk+(?:i+l+)?[\W_]*(?:y+(?:o+u+'*r*'*e*)?|u+r+e*)[\W_]*s+(?:e+l+f+)?\b

const IM_MATCH = /\b((?:i|l)(?:(?:'|`|‛|‘|’|′|‵)?m| am)) ([\s\S]*)/i,
  KYS_MATCH =
    /k+i+l+[\W_]*(?:y+o+'*u+'*r*'*e*'*|u+r+e*)[\W_]*s+e+l+f+|\bkys\b/i, // more avoidance proof for the lol
  FORMAT_MATCH = /(\*\*?\*?|``?`?|__?|~~|\|\|)+/i,
  WINNING_MATCH = /\b(?:play|played|playing)\b/i,
  SHUT_UP_MATCH = /\b(stfu|shut\s(?:the\s)?(?:fuck\s)?up)\b/i,
  GOODBYE_MATCH = /\b(?:good)?\s*bye\b/i,
  THANKS_MATCH = /\b(?:thank\s*you|thanks)\s+dad\b/i,
  FORTNITE_JAZZ_MATCH = /\bfortnite\s*jazz\b/i,
  GROK_MATCH = /\b(?:grok|gork)\s*is\s*this\s*true\b/i;

// Function to calculate whether a message has enough uppercase characters to be considered "shouting"
function volumeDown(message: string): boolean {
  let individualCharacters = message.split('').filter((a) => !a.match(/\s/));
  // If the message has no spaces, it's not shouting (probably)
  if (message.indexOf(' ') === -1) return false;
  let uppercaseCharacters = individualCharacters.filter((a) =>
    a.match(/[A-Z]/),
  ).length;
  // If the message has more than 60% uppercase characters, it's shouting
  return uppercaseCharacters / individualCharacters.length >= 0.6;
}

// Function to calculate whether a message should be responded to based on RNG
function doRandom(stuff: SettingsConfigObject): boolean {
  if (!stuff || stuff.RNG === null) return true;
  let r = Math.random();

  if (r <= stuff.RNG) return true;
  return false;
}

export default async function AutoResponseEvent(msg: Message) {
  // Ignore messages from bots
  if (msg.author.bot) return;
  // Increment the message count for statistics
  incrementMsgCount();
  // Get the settings for the message, and check if the user is blacklisted
  let settings = await getComputedSettings(msg),
    blStatus = await checkBlacklistStatus(msg);

  // If the user is blacklisted, and the blacklist includes the "responses" command, ignore the message
  if (
    blStatus &&
    (blStatus.commands.includes('all') ||
      blStatus.commands.includes('responses'))
  )
    return;

  // Playing matcher
  if (
    msg.content.match(WINNING_MATCH) &&
    settings.value.flags & Flags.WINNING_RESPONSES
  ) {
    if (!doRandom(settings.value)) return;
    incrementResponseCount();
    switch (msg.content.match(WINNING_MATCH)![0]) {
      case 'play':
        msg.client.rest.channels
          .createMessage(msg.channelID, {
            messageReference: {
              messageID: msg.id,
              channelID: msg.channelID,
              guildID: msg.guildID ?? undefined,
            },
            content: 'I hope ya win son!',
          })
          .catch(() => {});
        break;
      case 'playing':
        msg.client.rest.channels
          .createMessage(msg.channelID, {
            messageReference: {
              messageID: msg.id,
              channelID: msg.channelID,
              guildID: msg.guildID ?? undefined,
            },
            content: 'Are ya winning son?',
          })
          .catch(() => {});
        break;
      case 'played':
        msg.client.rest.channels
          .createMessage(msg.channelID, {
            messageReference: {
              messageID: msg.id,
              channelID: msg.channelID,
              guildID: msg.guildID ?? undefined,
            },
            content: 'Did ya win son?',
          })
          .catch(() => {});
    }
    return;
  }
  // End of Playing matcher
  // I'm matcher
  if (
    msg.content.match(IM_MATCH) &&
    settings.value.flags & Flags.IM_RESPONSES
  ) {
    if (!doRandom(settings.value)) return;
    // Increment the response count for statistics
    incrementResponseCount();
    // Send the response
    let imMatchData = msg.content.match(IM_MATCH)!,
      formattingMatchData = msg.content.match(FORMAT_MATCH),
      nick = msg.guildID ? msg.guild!.clientMember.nick : null,
      hiContent =
        !formattingMatchData || formattingMatchData.index! > imMatchData.index!
          ? `${imMatchData[2]}`
          : `${formattingMatchData[0]}${imMatchData[2]}`,
      imContent = nick ? nick : Math.random() * 1000 > 990 ? 'Dda' : 'Dad';

    if (hiContent.trim().toLowerCase() === imContent.trim().toLowerCase()) {
      msg.client.rest.channels
        .createMessage(msg.channelID, {
          messageReference: {
            messageID: msg.id,
            channelID: msg.channelID,
            guildID: msg.guildID ?? undefined,
          },
          allowedMentions: {
            everyone: msg.mentions.everyone, // Only mention everyone if the triggering message mentions everyone
            roles: msg.mentions.roles.slice(0, 2), // Mention a maximum of 2 roles the triggering message successfully mentioned
            users: msg.mentions.users.slice(0, 2).map((user) => user.id), // Limit to 2 user mentions
          },
          content: `You're not ${imContent}, I'm ${imContent}!`,
        })
        .catch(() => {});
      return;
    }

    msg.client.rest.channels
      .createMessage(msg.channelID, {
        messageReference: {
          messageID: msg.id,
          channelID: msg.channelID,
          guildID: msg.guildID ?? undefined,
        },
        allowedMentions: {
          everyone: msg.mentions.everyone, // Only mention everyone if the triggering message mentions everyone
          roles: msg.mentions.roles.slice(0, 2), // Mention a maximum of 2 roles the triggering message successfully mentioned
          users: msg.mentions.users.slice(0, 2).map((user) => user.id), // Limit to 2 user mentions
        },
        content: `Hi ${hiContent}, I'm ${imContent}!`,
      })
      .catch(() => {});
    return;
  }
  // End I'm matcher
  // Kys matcher
  if (
    msg.content.match(KYS_MATCH) &&
    settings.value.flags & Flags.KISS_RESPONSES
  ) {
    if (!doRandom(settings.value)) return;
    incrementResponseCount();
    msg.client.rest.channels
      .createMessage(msg.channelID, {
        messageReference: {
          messageID: msg.id,
          channelID: msg.channelID,
          guildID: msg.guildID ?? undefined,
        },
        content: `You better mean Kissing Your Self!`,
      })
      .catch(() => {});
    return;
  }
  // End of Kys matcher
  // Shut up matcher
  if (
    msg.content.match(SHUT_UP_MATCH) &&
    settings.value.flags & Flags.SHUT_UP_RESPONSES
  ) {
    if (!doRandom(settings.value)) return;
    incrementResponseCount();
    msg.client.rest.channels
      .createMessage(msg.channelID, {
        messageReference: {
          messageID: msg.id,
          channelID: msg.channelID,
          guildID: msg.guildID ?? undefined,
        },
        content: `Listen here ${
          msg.member && msg.member.nick ? msg.member.nick : msg.member!.username
        }, I will not tolerate you saying the words that consist of the letters 's h u t  u p' being said in this server, so take your own advice and close thine mouth in the name of the christian minecraft server owner.`,
      })
      .catch(() => {});
    return;
  }
  // End of Shut up matcher
  // Goodbye matcher
  if (
    msg.content.match(GOODBYE_MATCH) &&
    settings.value.flags & Flags.GOODBYE_RESPONSES
  ) {
    if (!doRandom(settings.value)) return;
    incrementResponseCount();
    msg.client.rest.channels
      .createMessage(msg.channelID, {
        messageReference: {
          messageID: msg.id,
          channelID: msg.channelID,
          guildID: msg.guildID ?? undefined,
        },
        content:
          Lists.goodbye[Math.floor(Math.random() * Lists.goodbye.length)],
      })
      .catch(() => {});
    return;
  }
  // End of Goodbye matcher
  // Thanks matcher
  if (
    msg.content.match(THANKS_MATCH) &&
    settings.value.flags & Flags.THANKS_RESPONSES
  ) {
    if (!doRandom(settings.value)) return;
    incrementResponseCount();
    msg.client.rest.channels
      .createMessage(msg.channelID, {
        messageReference: {
          messageID: msg.id,
          channelID: msg.channelID,
          guildID: msg.guildID ?? undefined,
        },
        content: Lists.thanks[Math.floor(Math.random() * Lists.thanks.length)],
      })
      .catch(() => {});
    return;
  }

  // End of Thanks matcher
  // Fortnite jazz matcher
  if (
    msg.content.match(FORTNITE_JAZZ_MATCH) &&
    settings.value.flags & Flags.FORTNITE_JAZZ_RESPONSES
  ) {
    if (!doRandom(settings.value)) return;
    incrementResponseCount();
    msg.client.rest.channels
      .createMessage(msg.channelID, {
        messageReference: {
          messageID: msg.id,
          channelID: msg.channelID,
          guildID: msg.guildID ?? undefined,
        },
        files: [
          {
            contents: await readFile('./fortnite_jazz.mp3'),
            name: 'fortnite_jazz.mp3',
          },
        ],
      })
      .catch(() => {});
    return;
  }
  // End of Fortnite jazz matcher
  // Caps matcher
  if (
    volumeDown(msg.content) &&
    settings.value.flags & Flags.SHOUTING_RESPONSES
  ) {
    if (!doRandom(settings.value)) return;
    incrementResponseCount();
    msg.client.rest.channels
      .createMessage(msg.channelID, {
        messageReference: {
          messageID: msg.id,
          channelID: msg.channelID,
          guildID: msg.guildID ?? undefined,
        },
        content: 'Keep your voice down!',
      })
      .catch(() => {});
    return;
  }
  // End of Caps matcher
  // Grok matcher
  if (
    msg.content.match(GROK_MATCH) &&
    settings.value.flags & Flags.GROK_RESPONSES
  ) {
    if (!doRandom(settings.value)) return;
    incrementResponseCount();
    const isGork =
      Math.random() < 0.01 || msg.content.toLowerCase().includes('gork');
    try {
      msg.client.rest.channels
        .createMessage(msg.channelID, {
          messageReference: {
            messageID: msg.id,
            channelID: msg.channelID,
            guildID: msg.guildID ?? undefined,
          },
          content: `Let me ask ${isGork ? 'Gork' : 'Grok'}.`,
        })
        .catch(() => {});
      const channel = await msg.client.rest.channels.get(msg.channelID);
      const dadhook = await Dadhook.giveMeDadhook(channel as any);
      await new Promise((resolve) => setTimeout(resolve, 6000)); // Wait 6 seconds before sending the response
      dadhook.execute({
        content: isGork
          ? Lists.gork[Math.floor(Math.random() * Lists.gork.length)]
          : Lists.grok[Math.floor(Math.random() * Lists.grok.length)],
        username: isGork ? 'Gork' : 'Grok',
        avatarURL: isGork
          ? 'https://cdn.alekeagle.me/ZV-wlPIk-b.png'
          : 'https://cdn.alekeagle.me/FBnktLNQXU.jpg',
        threadID: channel instanceof ThreadChannel ? channel.id : undefined,
      });
    } catch (e) {
      console.log('lol');
    }
  }
}

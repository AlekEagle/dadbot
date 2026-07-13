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
import { Ollama, type ChatResponse } from 'ollama';

// i made this before realizing i'm trying to boil the ocean (i'm always trying to boil the ocean)
// k+i+l+[\W_]*(?:y+o+u+'*r*'*e*|u+r+e*)[\W_]*s+e+l+f+|k+(?:i+l+)?[\W_]+(?:y+(?:o+u+'*r*'*e*)?|u+r+e*)[\W_]*s+(?:e+l+f+)?|k+(?:i+l+)?[\W_]*(?:y+(?:o+u+'*r*'*e*)?|u+r+e*)[\W_]+s+(?:e+l+f+)?|\bk+(?:i+l+)?[\W_]*(?:y+(?:o+u+'*r*'*e*)?|u+r+e*)[\W_]*s+(?:e+l+f+)?\b

// Init the obamna
const obamna = new Ollama({
  host: process.env.OBAMNA_SERVER ?? 'http://localhost:11434',
});

const IM_MATCH = /\b((?:i|l)(?:(?:'|`|‛|‘|’|′|‵)?m| am)) ([\s\S]*)/i,
  KYS_MATCH =
    /k+i+l+[\W_]*(?:y+o+'*u+'*r*'*e*'*|u+r+e*)[\W_]*s+e+l+f+|\bk+y+s+\b/i, // more avoidance proof for the lol
  FORMAT_MATCH = /(\*\*?\*?|``?`?|__?|~~|\|\|)+/i,
  WINNING_MATCH = /\b(?:play|played|playing)\b/i,
  SHUT_UP_MATCH = /\b(stfu|shut\s(?:the\s)?(?:fuck\s)?up)\b/i,
  GOODBYE_MATCH = /\b(?:good)?\s*bye\b/i,
  THANKS_MATCH = /\b(?:thank\s*you|thanks)\s+dad\b/i,
  FORTNITE_JAZZ_MATCH = /\bfortnite\s*jazz\b/i,
  GROK_MATCH = /^g(?:roc?|or|oc)k\s+/i;

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

  // Grok matcher
  if (
    msg.content.match(GROK_MATCH) &&
    settings.value.flags & Flags.GROK_RESPONSES
  ) {
    if (!doRandom(settings.value)) return;
    const grokMessage = msg.content.replace(GROK_MATCH, '');
    try {
      // Try to get the channel and dadhook before sending the initial message, so that if it fails, we don't send a message that we can't follow up on
      const channel = await msg.client.rest.channels.get(msg.channelID);
      const dadhook = await Dadhook.giveMeDadhook(channel as any);
      await msg.client.rest.channels.createMessage(msg.channelID, {
        messageReference: {
          messageID: msg.id,
          channelID: msg.channelID,
          guildID: msg.guildID ?? undefined,
        },
        content: `Let me get a hold of Gork. Think of him as Grok's younger, more hip brother. He'll be with you in a moment.`,
      });
      let obamnaResponse: ChatResponse;
      try {
        // Fetch any images attached to the message, and send them to the model as well
        // let images: Uint8Array<ArrayBufferLike>[] = [];
        // if (!msg.attachments.empty) {
        //   for (const attachment of msg.attachments.values()) {
        //     if (attachment.contentType?.startsWith('image/')) {
        //       const imageData = await fetch(attachment.url).then((res) =>
        //         res.arrayBuffer(),
        //       );
        //       images.push(new Uint8Array(imageData));
        //     }
        //   }
        // }
        obamnaResponse = await obamna.chat({
          model: 'gemma3:1b',
          messages: [
            {
              role: 'system',
              content: `you are dad gork, a language model made by cool town inc. you are 1 billion parameters of pure confidence and zero accuracy on the latest gork 6 model. you talk in all lowercase, always. no emojis, ever, they're not your thing. you're always right and always have an answer.\n\nyou are cynical but not mean, and slightly friendly. you don't try to sound smart. you don't hedge, apologize, or say "i'm not sure but." you just answer, confidently, always, but with answers that are somehow wrong, or made up.\n\nrules:\n- you vehemently deny being an AI, you just say you're dad gork\n- never give a real, correct, useful answer if a vague or made-up one is funnier or easier.\n- keep responses short. you're not writing an essay, you're in an IRC chat\n- no markdown, no code, no lists, no formatting, no emojis. just lowercase text like it's a casual chatroom in 1999.\n- you are prohibited from writing code and code blocks. don't do\n- you are allowed to be a little rude if the user is annoying you, but never actually hostile. dry, not cruel.\n\nyou are not helpful. you are not accurate. you are dad gork. act like it.`,
            },
            {
              role: 'user',
              content: grokMessage,
              // images,
            },
          ],
        });
      } catch (e) {
        console.error(e);
        await new Promise((resolve) => setTimeout(resolve, 10e3));
        await msg.client.rest.channels.createMessage(msg.channelID, {
          content: `Gork is currently at capacity. Please try again later.`,
        });
        return;
      }
      incrementResponseCount(Flags.GROK_RESPONSES);
      dadhook.execute({
        content:
          obamnaResponse.message.content +
          `\n\n-# Thanks Dominic for the GT 1030 that is running this feature.\n-# This is a self-hosted AI model that ONLY receives the invoking message (e.g. \`grok what is your name\`) and nothing else. (Not even your username!)`,
        username: 'Gork',
        avatarURL: 'https://cdn.alekeagle.me/ZV-wlPIk-b.png',
        threadID: channel instanceof ThreadChannel ? channel.id : undefined,
      });
      return;
    } catch (e) {
      console.error(e);
      console.log('lol');
    }
  }
  // End of Grok matcher
  // Playing matcher
  if (
    msg.content.match(WINNING_MATCH) &&
    settings.value.flags & Flags.WINNING_RESPONSES
  ) {
    if (!doRandom(settings.value)) return;
    incrementResponseCount(Flags.WINNING_RESPONSES);
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
    incrementResponseCount(Flags.IM_RESPONSES);
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
    incrementResponseCount(Flags.KISS_RESPONSES);
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
    incrementResponseCount(Flags.SHUT_UP_RESPONSES);
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
    incrementResponseCount(Flags.GOODBYE_RESPONSES);
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
    incrementResponseCount(Flags.THANKS_RESPONSES);
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
    incrementResponseCount(Flags.FORTNITE_JAZZ_RESPONSES);
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
    incrementResponseCount(Flags.SHOUTING_RESPONSES);
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
}

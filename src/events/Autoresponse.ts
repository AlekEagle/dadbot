import { checkBlacklistStatus } from '../utils/Blacklist';
import { EventModule } from '../types';
import ECH from 'eris-command-handler';
import {
  getValueByID,
  setValueByID,
  Flags,
  SettingsDataRtnValue
} from '../utils/Settings';
import { GuildTextableChannel, Message } from 'eris';
import { incrementMsgCount, incrementResponseCount } from '../utils/Statistics';
import { checkPremiumStatus } from '../utils/PremiumUtils';

const IM_MATCH = /\b((?:i|l)(?:(?:'|`|‛|‘|’|′|‵)?m| am)) ([\s\S]*)/i,
  KYS_MATCH = /\b(kys|kill\byour\s?self)\b/i,
  FORMAT_MATCH = /(\*\*?\*?|``?`?|__?|~~|\|\|)+/i,
  PLAYING_MATCH = /\b(?:play|played|playing)\b/i,
  SHUT_UP_MATCH = /\b(stfu|shut\s(?:the\s)?(?:fuck\s)?up)\b/i,
  premiumUserMap: Map<string, number> = new Map();

function doRandom(stuff: SettingsDataRtnValue) {
  if (stuff.RNG === null) return true;
  let r = Math.random();

  if (r <= stuff.RNG) return true;
  return false;
}

const __event: EventModule = {
  name: 'messageCreate',

  handler: async (client: ECH.CommandClient, msg: Message) => {
    if (msg.author.bot) return;
    incrementMsgCount();
    let usrSettings = await getValueByID(msg.author.id),
      channelSettings = await getValueByID(msg.channel.id),
      guildSettings = (msg.channel as GuildTextableChannel).guild
        ? await getValueByID((msg.channel as GuildTextableChannel).guild.id)
        : null,
      blStatus = await checkBlacklistStatus(msg);

    if (
      blStatus &&
      (blStatus.commands.includes('all') ||
        blStatus.commands.includes('responses'))
    )
      return;
    if (
      !msg.content.match(PLAYING_MATCH) &&
      msg.content.match(IM_MATCH) &&
      usrSettings.flags & Flags.IM_RESPONSES &&
      channelSettings.flags & Flags.IM_RESPONSES &&
      (guildSettings ? guildSettings.flags & Flags.IM_RESPONSES : true)
    ) {
      if (usrSettings.RNG === null) {
        if (!doRandom(guildSettings) || !doRandom(channelSettings)) return;
      } else {
        if (premiumUserMap.has(msg.author.id)) {
          let count = premiumUserMap.get(msg.author.id);
          if (count >= 50) {
            premiumUserMap.delete(msg.author.id);
            let isPremium = await checkPremiumStatus(client, msg.author.id);
            if (isPremium === undefined || isPremium === false) {
              await setValueByID(msg.author.id, {
                flags: usrSettings.flags,
                RNG: null
              });
            }
          } else {
            premiumUserMap.delete(msg.author.id);
            premiumUserMap.set(msg.author.id, count + 1);
          }
        } else {
          premiumUserMap.set(msg.author.id, 0);
        }
        if (!doRandom(usrSettings)) return;
      }
      incrementResponseCount();
      // I'm matcher
      let imMatchData = msg.content.match(IM_MATCH),
        formattingMatchData = msg.content.match(FORMAT_MATCH);

      if (
        !formattingMatchData ||
        formattingMatchData.index > imMatchData.index
      ) {
        msg.channel
          .createMessage(
            `Hi ${imMatchData[2]}, I'm ${
              (msg.channel as GuildTextableChannel).guild.members.get(
                client.user.id
              ).nick
                ? (msg.channel as GuildTextableChannel).guild.members.get(
                    client.user.id
                  ).nick
                : 'Dad'
            }!`
          )
          .catch(() => {});
      } else {
        msg.channel
          .createMessage(
            `Hi ${formattingMatchData[0]}${imMatchData[2]}, I'm ${
              (msg.channel as GuildTextableChannel).guild.members.get(
                client.user.id
              ).nick
                ? (msg.channel as GuildTextableChannel).guild.members.get(
                    client.user.id
                  ).nick
                : 'Dad'
            }!`
          )
          .catch(() => {});
      }
    }
    // End of I'm matcher
    // Kys matcher
    if (
      msg.content.match(KYS_MATCH) &&
      usrSettings.flags & Flags.KYS_RESPONSES &&
      channelSettings.flags & Flags.KYS_RESPONSES &&
      (guildSettings ? guildSettings.flags & Flags.KYS_RESPONSES : true)
    ) {
      incrementResponseCount();
      msg.channel
        .createMessage(
          `That was very rude ${
            msg.member.nick ? msg.member.nick : msg.author.username
          }, instead, take your own advice.`
        )
        .catch(() => {});
    }
    // End of Kys matcher
    // Playing matcher
    if (
      msg.content.match(PLAYING_MATCH) &&
      usrSettings.flags & Flags.WINNING_RESPONSES &&
      channelSettings.flags & Flags.WINNING_RESPONSES &&
      (guildSettings ? guildSettings.flags & Flags.WINNING_RESPONSES : true)
    ) {
      incrementResponseCount();
      switch (msg.content.match(PLAYING_MATCH)[0]) {
        case 'play':
          msg.channel.createMessage('I hope ya win son!').catch(() => {});
          break;
        case 'playing':
          msg.channel.createMessage('Are ya winning son?').catch(() => {});
          break;
        case 'played':
          msg.channel.createMessage('Did ya win son?').catch(() => {});
      }
    }
    // End of Playing matcher
    // Shut up matcher
    if (
      msg.content.match(SHUT_UP_MATCH) &&
      usrSettings.flags & Flags.SHUT_UP_RESPONSES &&
      channelSettings.flags & Flags.SHUT_UP_RESPONSES &&
      (guildSettings ? guildSettings.flags & Flags.SHUT_UP_RESPONSES : true)
    ) {
      incrementResponseCount();
      msg.channel
        .createMessage(
          `Listen here ${
            msg.member.nick ? msg.member.nick : msg.member.username
          }, I will not tolerate you saying the words that consist of the letters 's h u t  u p' being said in this server, so take your own advice and close thine mouth in the name of the christian minecraft server owner.`
        )
        .catch(() => {});
    }
  }
};

export default __event;

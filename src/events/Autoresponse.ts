import { checkBlacklistStatus } from '../utils/Blacklist';
import { EventModule } from '../types';
import ECH from 'eris-command-handler';
import {
  Flags,
  SettingsConfigObject,
  getComputedSettings,
  setUserSettings
} from '../utils/Settings';
import { GuildChannel, GuildTextableChannel, Message } from 'eris';
import { incrementMsgCount, incrementResponseCount } from '../utils/Statistics';
import { checkPremiumStatus } from '../utils/PremiumUtils';

const IM_MATCH = /\b((?:i|l)(?:(?:'|`|‛|‘|’|′|‵)?m| am)) ([\s\S]*)/i,
  KYS_MATCH = /\b(kys|kill\byour\s?self)\b/i,
  FORMAT_MATCH = /(\*\*?\*?|``?`?|__?|~~|\|\|)+/i,
  WINNING_MATCH = /\b(?:play|played|playing)\b/i,
  SHUT_UP_MATCH = /\b(stfu|shut\s(?:the\s)?(?:fuck\s)?up)\b/i,
  GOODBYE_MATCH = /\b(?:good)? ?bye\b/i,
  THANKS_MATCH = /\b(?:thank you|thanks) dad\b/i,
  premiumUserMap: Map<string, number> = new Map();

function volumeDown(msg: string): boolean {
  let splitMsg = msg.split('').filter(a => !a.match(/\s/));
  if (msg.indexOf(' ') === -1) return false;
  let upCase = splitMsg.filter(a => a.match(/[A-Z]/)).length;
  return upCase / splitMsg.length >= 0.6;
}

function doRandom(stuff: SettingsConfigObject) {
  if (!stuff || stuff.RNG === null) return true;
  let r = Math.random();

  if (r <= stuff.RNG) return true;
  return false;
}

const __event: EventModule = {
  name: 'messageCreate',

  handler: async (client: ECH.CommandClient, msg: Message) => {
    if (msg.author.bot) return;
    incrementMsgCount();
    let settings = await getComputedSettings(msg),
      blStatus = await checkBlacklistStatus(msg);

    if (
      blStatus &&
      (blStatus.commands.includes('all') ||
        blStatus.commands.includes('responses'))
    )
      return;
    // I'm matcher
    if (
      !msg.content.match(WINNING_MATCH) &&
      msg.content.match(IM_MATCH) &&
      settings.value.flags & Flags.IM_RESPONSES
    ) {
      if (settings.inheritedFrom.RNG !== 'user') {
        if (!doRandom(settings.value)) return;
      } else {
        if (premiumUserMap.has(msg.author.id)) {
          let count = premiumUserMap.get(msg.author.id);
          if (count >= 50) {
            premiumUserMap.delete(msg.author.id);
            let isPremium = await checkPremiumStatus(client, msg.author.id);
            if (isPremium === undefined || isPremium === false) {
              await setUserSettings(msg.author.id, undefined, null);
            }
          } else {
            premiumUserMap.delete(msg.author.id);
            premiumUserMap.set(msg.author.id, count + 1);
          }
        } else {
          premiumUserMap.set(msg.author.id, 0);
        }
        if (!doRandom(settings.value)) return;
      }
      incrementResponseCount();
      let imMatchData = msg.content.match(IM_MATCH),
        formattingMatchData = msg.content.match(FORMAT_MATCH),
        nick =
          msg.channel instanceof GuildChannel
            ? (msg.channel as GuildTextableChannel).guild.members.get(
                client.user.id
              ).nick
            : null,
        hiContent =
          !formattingMatchData || formattingMatchData.index > imMatchData.index
            ? `${imMatchData[2]}`
            : `${formattingMatchData[0]}${imMatchData[2]}`,
        imContent = nick ? nick : 'Dad';

      msg.channel
        .createMessage({
          allowedMentions: {
            everyone: msg.mentionEveryone,
            roles: msg.roleMentions
              .map(roleId =>
                (msg.channel as GuildTextableChannel).guild.roles.get(roleId)
              )
              .filter(
                role =>
                  role.mentionable ||
                  msg.member?.permissions.has('mentionEveryone')
              )
              .map(role => role.id),
            users: msg.mentions.slice(0, 2).map(user => user.id)
          },
          content: `Hi ${hiContent}, I'm ${imContent}!`
        })
        .catch(() => {});
      return;
    }
    // End of I'm matcher
    // Kys matcher
    if (
      msg.content.match(KYS_MATCH) &&
      settings.value.flags & Flags.KYS_RESPONSES
    ) {
      incrementResponseCount();
      msg.channel
        .createMessage(`You better mean Kissing Your Self!`)
        .catch(() => {});
      return;
    }
    // End of Kys matcher
    // Playing matcher
    if (
      msg.content.match(WINNING_MATCH) &&
      settings.value.flags & Flags.WINNING_RESPONSES
    ) {
      incrementResponseCount();
      switch (msg.content.match(WINNING_MATCH)[0]) {
        case 'play':
          msg.channel.createMessage('I hope ya win son!').catch(() => {});
          break;
        case 'playing':
          msg.channel.createMessage('Are ya winning son?').catch(() => {});
          break;
        case 'played':
          msg.channel.createMessage('Did ya win son?').catch(() => {});
      }
      return;
    }
    // End of Playing matcher
    // Shut up matcher
    if (
      msg.content.match(SHUT_UP_MATCH) &&
      settings.value.flags & Flags.SHUT_UP_RESPONSES
    ) {
      incrementResponseCount();
      msg.channel
        .createMessage(
          `Listen here ${
            msg.member && msg.member.nick
              ? msg.member.nick
              : msg.member.username
          }, I will not tolerate you saying the words that consist of the letters 's h u t  u p' being said in this server, so take your own advice and close thine mouth in the name of the christian minecraft server owner.`
        )
        .catch(() => {});
      return;
    }
    // End of Shut up matcher
    // Goodbye matcher
    if (
      msg.content.match(GOODBYE_MATCH) &&
      settings.value.flags & Flags.GOODBYE_RESPONSES
    ) {
      incrementResponseCount();
      let possibleGoodbyes = [
        'Bye!',
        'Bye, have fun!',
        "Bye, don't get in trouble!",
        'Stay out of trouble!',
        'Be home before 8!',
        'Later champ!'
      ];
      msg.channel
        .createMessage(
          possibleGoodbyes[Math.floor(Math.random() * possibleGoodbyes.length)]
        )
        .catch(() => {});
      return;
    }
    // End of Goodbye matcher
    // Thanks matcher
    if (
      msg.content.match(THANKS_MATCH) &&
      settings.value.flags & Flags.THANKS_RESPONSES
    ) {
      incrementResponseCount();
      let possibleResponses = [
        "That's what I'm here for.",
        "Don't mention it champ.",
        'Next time just ask.',
        "Oh, uh, you're welcome I guess?"
      ];
      msg.channel
        .createMessage(
          possibleResponses[
            Math.floor(Math.random() * possibleResponses.length)
          ]
        )
        .catch(() => {});
      return;
    }
    // End of Thanks matcher
    // Caps matcher
    if (
      volumeDown(msg.content) &&
      settings.value.flags & Flags.SHOUTING_RESPONSES
    ) {
      incrementResponseCount();
      msg.channel.createMessage('Keep your voice down!').catch(() => {});
      return;
    }
    // End of Caps matcher
  }
};

export default __event;

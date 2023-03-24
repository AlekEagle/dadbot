import { checkBlacklistStatus } from "../utils/Blacklist";
import {
  Flags,
  SettingsConfigObject,
  getComputedSettings,
} from "../utils/Settings";
import { TextableChannel, Message } from "oceanic.js";
import { incrementMsgCount, incrementResponseCount } from "../utils/Statistics";
import Lists from "../utils/Lists";

const IM_MATCH = /\b((?:i|l)(?:(?:'|`|‛|‘|’|′|‵)?m| am)) ([\s\S]*)/i,
  KYS_MATCH = /\b(kys|kill\byour\s?self)\b/i,
  FORMAT_MATCH = /(\*\*?\*?|``?`?|__?|~~|\|\|)+/i,
  WINNING_MATCH = /\b(?:play|played|playing)\b/i,
  SHUT_UP_MATCH = /\b(stfu|shut\s(?:the\s)?(?:fuck\s)?up)\b/i,
  GOODBYE_MATCH = /\b(?:good)? ?bye\b/i,
  THANKS_MATCH = /\b(?:thank you|thanks) dad\b/i;

// Function to calculate whether a message has enough uppercase characters to be considered "shouting"
function volumeDown(message: string): boolean {
  let individualCharacters = message.split("").filter((a) => !a.match(/\s/));
  // If the message has no spaces, it's not shouting (probably)
  if (message.indexOf(" ") === -1) return false;
  let uppercaseCharacters = individualCharacters.filter((a) =>
    a.match(/[A-Z]/)
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
    (blStatus.commands.includes("all") ||
      blStatus.commands.includes("responses"))
  )
    return;

  // Playing matcher
  if (
    msg.content.match(WINNING_MATCH) &&
    settings.value.flags & Flags.WINNING_RESPONSES
  ) {
    incrementResponseCount();
    switch (msg.content.match(WINNING_MATCH)[0]) {
      case "play":
        msg.client.rest.channels
          .createMessage(msg.channelID, { content: "I hope ya win son!" })
          .catch(() => {});
        break;
      case "playing":
        msg.client.rest.channels
          .createMessage(msg.channelID, { content: "Are ya winning son?" })
          .catch(() => {});
        break;
      case "played":
        msg.client.rest.channels
          .createMessage(msg.channelID, { content: "Did ya win son?" })
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
    let imMatchData = msg.content.match(IM_MATCH),
      formattingMatchData = msg.content.match(FORMAT_MATCH),
      nick = msg.guildID ? msg.guild.clientMember.nick : null,
      hiContent =
        !formattingMatchData || formattingMatchData.index > imMatchData.index
          ? `${imMatchData[2]}`
          : `${formattingMatchData[0]}${imMatchData[2]}`,
      imContent = nick ? nick : "Dad";

    msg.client.rest.channels
      .createMessage(msg.channelID, {
        allowedMentions: {
          everyone: msg.mentions.everyone,
          roles: msg.mentions.roles
            .map((roleId) =>
              (msg.channel as TextableChannel).guild.roles.get(roleId)
            )
            .filter(
              (role) =>
                role.mentionable ||
                msg.member?.permissions.has("MENTION_EVERYONE")
            )
            .map((role) => role.id),
          users: msg.mentions.users.slice(0, 2).map((user) => user.id),
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
    incrementResponseCount();
    msg.client.rest.channels
      .createMessage(msg.channelID, {
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
    incrementResponseCount();
    msg.client.rest.channels
      .createMessage(msg.channelID, {
        content: `Listen here ${
          msg.member && msg.member.nick ? msg.member.nick : msg.member.username
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
    incrementResponseCount();
    msg.client.rest.channels
      .createMessage(msg.channelID, {
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
    incrementResponseCount();
    msg.client.rest.channels
      .createMessage(msg.channelID, {
        content: Lists.thanks[Math.floor(Math.random() * Lists.thanks.length)],
      })
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
    msg.client.rest.channels
      .createMessage(msg.channelID, { content: "Keep your voice down!" })
      .catch(() => {});
    return;
  }
  // End of Caps matcher
}

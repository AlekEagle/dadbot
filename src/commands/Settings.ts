import { CommandModule } from '../types';
import ReactionMenu, {
  EmojiMap,
  ReactionMenuState
} from '../utils/ReactionMenu';
import { isOwner } from '../utils/Owners';
import * as SettingsUtils from '../utils/Settings';
import { updatePrefix, removePrefix } from '../utils/Prefixes';
import Eris, { Message } from 'eris';

const Settings: CommandModule = {
  name: 'settings',

  async handler(client, msg: Eris.Message<Eris.GuildTextableChannel>, args) {
    let defaultState: ReactionMenuState = {
      async message() {
        let fields = [
          {
            name: '👤',
            value: 'React with this emoji to manage your personal settings!'
          },
          {
            name: '⏹️',
            value: 'React with this emoji to exit the menu!'
          }
        ];
        if (
          msg.member.permissions.has('administrator') ||
          (await isOwner(msg.author.id))
        )
          fields.unshift({
            name: '🌆',
            value: "React with this emoji to manage the server's settings!"
          });
        return {
          embed: {
            title: 'Settings Menu',
            description: 'Use the reactions to navigate the menu!',
            fields
          }
        };
      },
      reactions: new EmojiMap()
    };
    if (
      msg.member.permissions.has('administrator') ||
      (await isOwner(msg.author.id))
    )
      defaultState.reactions.set({ name: '🌆', id: null }, (message, user) => {
        menu.setState('serverSettings');
      });

    defaultState.reactions.set({ name: '👤', id: null }, () =>
      menu.setState('userSettings')
    );
    defaultState.reactions.set({ name: '⏹️', id: null }, () => menu.endMenu());
    let menu = new ReactionMenu(client, msg, defaultState);

    let cursorPos = 0,
      selectedChannelID = msg.channel.id;

    let userSettings: ReactionMenuState = {
      async message() {
        let prefs = await SettingsUtils.getValueByID(msg.author.id);
        return {
          embed: {
            title: 'User Settings',
            thumbnail: {
              url: msg.author.dynamicAvatarURL()
            },
            description:
              'Use 🔼 and 🔽 to select what setting you want to modify, ⏺️ to toggle your selection, and use ⏹️ to go back to the previous menu!',
            fields: SettingsUtils.enumToArray(SettingsUtils.Flags).map(
              (k: string, i) => {
                return {
                  name: i === cursorPos ? `> ${k}` : k,
                  value: `Is currently \`${
                    prefs.flags &
                    SettingsUtils.Flags[k as keyof typeof SettingsUtils.Flags]
                      ? 'ENABLED'
                      : 'DISABLED'
                  }\``
                };
              }
            )
          }
        };
      },
      reactions: new EmojiMap()
    };

    userSettings.reactions.set({ name: '🔼', id: null }, () => {
      if (--cursorPos < 0)
        cursorPos = SettingsUtils.enumToArray(SettingsUtils.Flags).length - 1;
    });
    userSettings.reactions.set({ name: '🔽', id: null }, () => {
      if (++cursorPos >= SettingsUtils.enumToArray(SettingsUtils.Flags).length)
        cursorPos = 0;
    });
    userSettings.reactions.set({ name: '⏺️', id: null }, async () => {
      let prefs = await SettingsUtils.getValueByID(msg.author.id);
      let curFlag = SettingsUtils.enumToArray(SettingsUtils.Flags)[
        cursorPos
      ] as keyof typeof SettingsUtils.Flags;
      let newFlags: SettingsUtils.Flags =
        prefs.flags & SettingsUtils.Flags[curFlag]
          ? prefs.flags & ~SettingsUtils.Flags[curFlag]
          : prefs.flags | SettingsUtils.Flags[curFlag];
      await SettingsUtils.setValueByID(msg.author.id, {
        RNG: prefs.RNG,
        flags: newFlags
      });
      await new Promise((resolve, reject) => {
        setTimeout(resolve, 500);
      });
    });
    userSettings.reactions.set({ name: '⏹️', id: null }, () =>
      menu.setState('default')
    );
    menu.addState('userSettings', userSettings);

    let serverSettings: ReactionMenuState = {
      async message() {
        let prefs = await SettingsUtils.getValueByID(msg.channel.guild.id);
        return {
          embed: {
            title: 'Server Settings',
            thumbnail: {
              url: msg.channel.guild.dynamicIconURL()
            },
            description:
              'Use 🔼 and 🔽 to select what setting you want to modify, ⏺️ to toggle your selection, #⃣ to switch between server and channel mode, ❗ to change the server prefix, and use ⏹️ to go back to the previous menu!',
            fields: [
              ...SettingsUtils.enumToArray(SettingsUtils.Flags).map(
                (k: string, i) => {
                  return {
                    name: i === cursorPos ? `> ${k}` : k,
                    value: `Is currently \`${
                      prefs.flags &
                      SettingsUtils.Flags[k as keyof typeof SettingsUtils.Flags]
                        ? 'ENABLED'
                        : 'DISABLED'
                    }\``
                  };
                }
              ),
              {
                name: 'Server Prefix',
                value: `\`${
                  client.guildPrefixes[msg.channel.guild.id]
                    ? (client.guildPrefixes[msg.channel.guild.id] as string)
                    : (client.commandOptions.prefix as string)
                }\``
              }
            ]
          }
        };
      },
      reactions: new EmojiMap()
    };

    serverSettings.reactions.set({ name: '🔼', id: null }, () => {
      if (--cursorPos < 0)
        cursorPos = SettingsUtils.enumToArray(SettingsUtils.Flags).length - 1;
    });
    serverSettings.reactions.set({ name: '🔽', id: null }, () => {
      if (++cursorPos >= SettingsUtils.enumToArray(SettingsUtils.Flags).length)
        cursorPos = 0;
    });

    serverSettings.reactions.set({ name: '⏺️', id: null }, async () => {
      let prefs = await SettingsUtils.getValueByID(msg.channel.guild.id);
      let curFlag = SettingsUtils.enumToArray(SettingsUtils.Flags)[
        cursorPos
      ] as keyof typeof SettingsUtils.Flags;
      let newFlags: SettingsUtils.Flags =
        prefs.flags & SettingsUtils.Flags[curFlag]
          ? prefs.flags & ~SettingsUtils.Flags[curFlag]
          : prefs.flags | SettingsUtils.Flags[curFlag];
      await SettingsUtils.setValueByID(msg.channel.guild.id, {
        RNG: prefs.RNG,
        flags: newFlags
      });
      await new Promise((resolve, reject) => {
        setTimeout(resolve, 500);
      });
    });

    serverSettings.reactions.set({ name: '#⃣', id: null }, () => {
      menu.setState('channelSettings');
    });

    serverSettings.reactions.set({ name: '⏹️', id: null }, () => {
      menu.setState('default');
    });

    let newPrefix: string;

    async function setPrefixHandler(
      mesg: Eris.Message<Eris.GuildTextableChannel>
    ) {
      if (
        mesg.author.bot ||
        mesg.channel.id !== msg.channel.id ||
        mesg.author.id !== msg.author.id
      )
        return;
      menu.restartInactivityTimer();
      let match = mesg.content.match(/`((?!`).{1,}?)`/i);
      if (!match) {
        newPrefix = mesg.content;
      } else {
        newPrefix = match[1];
      }
      await mesg.delete();
      client.off('messageCreate', setPrefixHandler);
      menu.setState('confirmPrefix');
    }

    let confirmPrefix: ReactionMenuState = {
      async message() {
        return {
          embed: {
            title: 'Confirm Prefix',
            description: `Are you 100% sure you want your prefix to be \`${newPrefix}\`? This means to use dad bot you'll have to use commands like: \`${newPrefix}help\``
          }
        };
      },
      reactions: new EmojiMap()
    };

    confirmPrefix.reactions.set({ name: '✅', id: null }, async () => {
      await updatePrefix(client, msg.channel.guild.id, newPrefix);
      await menu.setState('serverSettings');
    });

    confirmPrefix.reactions.set({ name: '❎', id: null }, async () => {
      await menu.setState('serverSettings');
    });

    menu.addState('confirmPrefix', confirmPrefix);

    serverSettings.reactions.set(
      {
        name: '❗',
        id: null
      },
      async (message, user) => {
        newPrefix = '';
        await menu.setState('setPrefix');
        client.on('messageCreate', setPrefixHandler);
      }
    );

    let setPrefix: ReactionMenuState = {
      message: {
        embed: {
          title: 'Set Prefix',
          description:
            '**THIS WILL CHANGE THE PREFIX YOU USE TO CONTROL THE BOT, IF YOU DON\'T WANT THIS TO HAPPEN USE THE ⏹️ REACTION TO CANCEL.** To reset the prefix to default, use 🔄 to reset it!\n\nSend a message with the new prefix you want the bot to respond to. If you want spaces in the prefix, like: `dad help`, enclose the prefix in backticks (\\`), so to use a command like `dad help`, send "\\`dad \\`".'
        }
      },
      reactions: new EmojiMap()
    };

    setPrefix.reactions.set({ name: '🔄', id: null }, async () => {
      client.off('messageCreate', setPrefixHandler);
      await removePrefix(client, msg.channel.guild.id);
      menu.setState('serverSettings');
    });

    setPrefix.reactions.set({ name: '⏹️', id: null }, () => {
      client.off('messageCreate', setPrefixHandler);
      menu.setState('serverSettings');
    });

    menu.addState('setPrefix', setPrefix);

    menu.addState('serverSettings', serverSettings);

    let channelSettings: ReactionMenuState = {
      async message() {
        let prefs = await SettingsUtils.getValueByID(selectedChannelID);
        return {
          embed: {
            title: `Channel Settings \`#${
              msg.channel.guild.channels.get(selectedChannelID).name
            }\``,
            thumbnail: {
              url: msg.channel.guild.dynamicIconURL()
            },
            description:
              "Use 🔼 and 🔽 to select what setting you want to modify, ⏺️ to toggle your selection, #⃣ to switch between server and channel mode, 🔄 to change what channel you're managing, and use ⏹️ to go back to the previous menu!",
            fields: [
              ...SettingsUtils.enumToArray(SettingsUtils.Flags).map(
                (k: string, i) => {
                  return {
                    name: i === cursorPos ? `> ${k}` : k,
                    value: `Is currently \`${
                      prefs.flags &
                      SettingsUtils.Flags[k as keyof typeof SettingsUtils.Flags]
                        ? 'ENABLED'
                        : 'DISABLED'
                    }\``
                  };
                }
              )
            ]
          }
        };
      },
      reactions: new EmojiMap()
    };

    channelSettings.reactions.set({ name: '🔼', id: null }, () => {
      if (--cursorPos < 0)
        cursorPos = SettingsUtils.enumToArray(SettingsUtils.Flags).length - 1;
    });
    channelSettings.reactions.set({ name: '🔽', id: null }, () => {
      if (++cursorPos >= SettingsUtils.enumToArray(SettingsUtils.Flags).length)
        cursorPos = 0;
    });

    channelSettings.reactions.set({ name: '⏺️', id: null }, async () => {
      let prefs = await SettingsUtils.getValueByID(selectedChannelID);
      let curFlag = SettingsUtils.enumToArray(SettingsUtils.Flags)[
        cursorPos
      ] as keyof typeof SettingsUtils.Flags;
      let newFlags: SettingsUtils.Flags =
        prefs.flags & SettingsUtils.Flags[curFlag]
          ? prefs.flags & ~SettingsUtils.Flags[curFlag]
          : prefs.flags | SettingsUtils.Flags[curFlag];
      await SettingsUtils.setValueByID(selectedChannelID, {
        RNG: prefs.RNG,
        flags: newFlags
      });
      await new Promise((resolve, reject) => {
        setTimeout(resolve, 500);
      });
    });
    channelSettings.reactions.set({ name: '#⃣', id: null }, () => {
      menu.setState('serverSettings');
    });
    channelSettings.reactions.set({ name: '🔄', id: null }, () => {
      menu.setState('changeChannel');
      client.on('messageCreate', changeChannelHandler);
    });
    channelSettings.reactions.set({ name: '⏹️', id: null }, () =>
      menu.setState('default')
    );
    menu.addState('channelSettings', channelSettings);

    let changeChannel: ReactionMenuState = {
      message: {
        embed: {
          title: 'Change Channel',
          description:
            'Mention, send the name, or send the ID of the channel to switch to that channel. '
        }
      },
      reactions: new EmojiMap()
    };

    menu.addState('changeChannel', changeChannel);

    function changeChannelHandler(
      mesg: Eris.Message<Eris.GuildTextableChannel>
    ) {
      if (
        mesg.author.bot ||
        mesg.channel.id !== msg.channel.id ||
        mesg.author.id !== msg.author.id
      )
        return;
      menu.restartInactivityTimer();
      if (mesg.channelMentions.length < 1) {
        let chnl = mesg.channel.guild.channels.find(
          c => c.name === mesg.content || c.id === mesg.content
        );
        if (!chnl) {
          mesg.channel.createMessage("That's not a valid channel!").then(a => {
            setTimeout(() => {
              a.delete();
            }, 5000);
          });
        } else {
          selectedChannelID = chnl.id;
          menu.setState('channelSettings');
          client.off('messageCreate', changeChannelHandler);
        }
      } else {
        selectedChannelID = mesg.channelMentions[0];
        menu.setState('channelSettings');
        client.off('messageCreate', changeChannelHandler);
      }
      mesg.delete();
    }

    changeChannel.reactions.set({ name: '⏹️', id: null }, () => {
      menu.setState('channelSettings');
      client.off('messageCreate', changeChannelHandler);
    });
  }
};

export default Settings;

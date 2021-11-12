import { CommandModule } from '../types';
import ReactionMenu, {
  EmojiMap,
  ReactionMenuState
} from '../utils/ReactionMenu';
import { isOwner } from '../utils/Owners';
import * as SettingsUtils from '../utils/Settings';
import { updatePrefix } from '../utils/Prefixes';
import Eris from 'eris';

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
                value: client.guildPrefixes[msg.channel.guild.id] as string
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
    });
    serverSettings.reactions.set({ name: '⏹️', id: null }, () =>
      menu.setState('default')
    );

    serverSettings.reactions.set(
      {
        name: '❗',
        id: null
      },
      (message, user) => {}
    );

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
    });
    channelSettings.reactions.set({ name: '⏹️', id: null }, () =>
      menu.setState('default')
    );
    menu.addState('channelSettings', channelSettings);
  }
};

export default Settings;

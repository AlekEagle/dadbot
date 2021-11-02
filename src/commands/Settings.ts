import { CommandModule } from '../types';
import ReactionMenu, {
  EmojiMap,
  ReactionMenuState
} from '../utils/ReactionMenu';
import { isOwner } from '../utils/Owners';
import * as SettingsUtils from '../utils/Settings';
import Eris from 'eris';

const Settings: CommandModule = {
  name: 'settings',

  async handler(client, msg: Eris.Message<Eris.GuildTextableChannel>, args) {
    let defaultStateReactions = new EmojiMap();

    if (
      msg.member.permissions.has('administrator') ||
      (await isOwner(msg.author.id))
    )
      defaultStateReactions.set({ name: '🌆', id: null }, (message, user) => {
        menu.setState('serverSettings');
      });

    defaultStateReactions.set({ name: '👤', id: null }, () =>
      menu.setState('userSettings')
    );
    defaultStateReactions.set({ name: '⏹️', id: null }, () => menu.endMenu());

    let defaultState: ReactionMenuState = {
      message: async () => {
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
      reactions: defaultStateReactions
    };
    let menu = new ReactionMenu(client, msg, defaultState);

    menu.addState('userSettings', {
      message: async () => {
        return {
          embed: {
            title: 'User Settings',
            thumbnail: {
              url: msg.author.dynamicAvatarURL()
            },
            description:
              'Use 🔼 and 🔽 to select what setting you want to modify, ⏺️ to toggle your selection, and use ⏹️ to go back to the previous menu!'
          }
        };
      },
      reactions: new EmojiMap()
    });
  }
};

export default Settings;

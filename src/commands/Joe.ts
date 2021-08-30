import { GuildTextableChannel, Message } from 'eris';
import { CommandModule } from '../types';
import ReactionMenu, { EmojiMap } from '../utils/ReactionMenu';

const __command: CommandModule = {
  name: 'test',

  async handler(client, msg, args) {
    let defaultState = new EmojiMap();
    defaultState.set({ name: '😳', id: null }, () => {
      msg.channel.createMessage('joe');
    });
    defaultState.set({ name: '🖕', id: null }, () => {
      reactionMenu.endMenu();
    });
    defaultState.set({ name: '✍️', id: null }, () => {
      reactionMenu.resendMessage();
    });
    let reactionMenu = new ReactionMenu(
      client,
      msg as Message<GuildTextableChannel>,
      {
        message: 'hi',
        reactions: defaultState
      },
      '5s'
    );
  },

  options: {
    guildOnly: true
  }
};

export default __command;

import { GuildTextableChannel, Message, PartialEmoji } from 'eris';
import { CommandModule } from '../types';
import ReactionMenu from '../utils/ReactionMenu';

const __command: CommandModule = {
  name: 'test',

  async handler(client, msg, args) {
    let reactionMenu = new ReactionMenu(
      client,
      msg as Message<GuildTextableChannel>,
      {
        message: 'hi',
        reactions: new Map([
          [
            { name: '😳', id: null } as PartialEmoji,
            () => {
              msg.channel.createMessage('joe');
            }
          ]
        ])
      }
    );
  },

  options: {
    guildOnly: true
  }
};

export default __command;

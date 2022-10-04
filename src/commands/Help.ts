import { GuildTextableChannel, Message } from 'eris';
import ReactionMenu, { EmojiMap } from '../utils/ReactionMenu';
import ms from 'ms';
import { client } from '..';

const cmdsPerPage = 5;

const Help: CommandModule = {
  name: 'help',

  async handler(msg, args) {
    const defaultState = new EmojiMap(),
      commands = Object.entries(client.commands).filter(c => !c[1].hidden);
    let page = 0;

    defaultState.set({ name: '⏪', id: null }, () => {
      page = 0;
    });
    defaultState.set({ name: '◀', id: null }, () => {
      page =
        page < 1
          ? Math.ceil(Object.keys(commands).length / cmdsPerPage) - 1
          : page - 1;
    });
    defaultState.set({ name: '⏹', id: null }, () => {
      reactionMenu.endMenu();
    });
    defaultState.set({ name: '▶', id: null }, () => {
      page =
        page + 1 === Math.ceil(Object.keys(commands).length / cmdsPerPage)
          ? 0
          : page + 1;
    });
    defaultState.set({ name: '⏩', id: null }, () => {
      page = Math.ceil(Object.keys(commands).length / cmdsPerPage) - 1;
    });
    const reactionMenu = new ReactionMenu(
      client,
      msg as Message<GuildTextableChannel>,
      {
        message: () => {
          let curPageCommands = commands.slice(
            page * cmdsPerPage,
            page * cmdsPerPage + cmdsPerPage
          );
          return {
            embed: {
              title: 'Help Menu',
              description: `**${client.commandOptions.name}**
${client.commandOptions.description}

Made by: ${client.commandOptions.owner}
Default prefix: \`${client.commandOptions.prefix}\`

Use the forward and reverse reactions to navigate through pages! Use the stop button to close this!

Usage legend: \`\`\`<thing> = required, substitute this for a one word argument
[thing] = optional, can be substituted, otherwise left blank
{thing} = required multi-word, substitute this for a one or more word arguement
[{thing}] = optional multi-word, can be substituted, otherwise left blank
<thing1|thing2> = required choice between thing1 and thing2
[thing1|thing2] = optional choice between thing1 and thing2, can also be left blank\`\`\``,
              fields: curPageCommands.map(cmd => {
                return {
                  name: cmd[0],
                  value: `Usage: ${
                    cmd[1].usage ? `\`${cmd[1].usage}\`` : 'None Specified'
                  }
Description: ${cmd[1].description}
Cooldown: ${cmd[1].cooldown > 0 ? ms(cmd[1].cooldown) : 'None'}
Aliases: ${cmd[1].aliases.length > 0 ? cmd[1].aliases.join(', ') : 'None'}${
                    cmd[1].dmOnly
                      ? '\nThis command can only be used in a DM with the bot.'
                      : ''
                  }${
                    cmd[1].guildOnly
                      ? '\nThis command can only be used in a server with the bot.'
                      : ''
                  }`
                };
              }),
              footer: {
                text: `Page ${page + 1} of ${Math.ceil(
                  Object.keys(commands).length / cmdsPerPage
                )}`
              }
            }
          };
        },
        reactions: defaultState
      }
    );
  },

  options: {
    guildOnly: true,
    description: 'This help command.',
    usage: '[command]'
  }
};

export default Help;

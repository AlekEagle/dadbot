'use strict';

const settings = require('../functions/settings'),
  prefixes = require('../functions/managePrefixes'),
  owners = require('../functions/getOwners'),
  ReactionMenu = require('../functions/reactionMenu');

module.exports = {
  name: 'settings',

  exec: (client, msg, args) => {
    let menu = new ReactionMenu(
        client,
        msg,
        msg.author.id,
        {
          embed: {
            title: 'Settings',
            thumbnail: {
              url:
                'https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/160/twitter/248/gear_2699.png'
            },
            description: 'Manage any setting for yourself or the server!',
            fields: [
              {
                name: '🌆',
                value: 'Manage settings for the server/channel!',
                inline: false
              },
              {
                name: '👤',
                value: 'Manage settings for yourself!',
                inline: false
              },
              {
                name: '⏹',
                value: 'Exit settings.'
              }
            ]
          }
        },
        ['🌆', '👤', '⏹']
      ),
      selection = 0,
      channelSelection = msg.channel.id;
    menu.addEmoji('default', '⏹', () => menu.close());
    menu.addState('noperms', {
      message: {
        embed: {
          title: 'Insufficient Permissions!',
          description:
            'You need `MANAGE_SERVER` or higher to edit server settings!',
          color: parseInt('0xff0000')
        }
      }
    });
    menu.addEmoji('default', '🌆', async (message, user) => {
      if (
        (await owners.isAdmin(user.id)) ||
        message.channel.guild.members
          .get(user.id)
          .permission.has('manageServer') ||
        message.channel.guild.members
          .get(user.id)
          .permission.has('administrator')
      )
        menu.setState('serversettings');
      else {
        menu.setState('noperms');
        setTimeout(() => menu.setState('default'), 5000);
      }
      selection = 0;
    });
    menu.addEmoji('default', '👤', () => {
      menu.setState('usersettings');
      selection = 0;
    });
    menu.addState('serversettings', {
      message: async () => {
        let setngs = await settings.getValueByID(msg.channel.guild.id);
        return {
          embed: {
            title: 'Server Settings',
            description:
              'Use ⬆️ and ⬇️ to select what to change and use ⏺ to toggle your selection! Use #️⃣ to switch to channel settings! Use ❗ to change the bots prefix! Use ⏹ to go back to the main menu.',
            thumbnail: {
              url: msg.channel.guild.dynamicIconURL(
                msg.channel.guild.icon
                  ? msg.channel.guild.icon.startsWith('a_')
                    ? 'gif'
                    : 'png'
                  : 'png',
                256
              )
            },
            fields: [
              ...settings.flags.map((i, o, s) => {
                return {
                  name: `${selection === o ? '> ' : ''}${i}`,
                  value: `is currently set to \`${
                    settings.getFlags(setngs.flags).includes(i)
                      ? 'ENABLED'
                      : 'DISABLED'
                  }\``
                };
              }),
              {
                name: 'Prefix',
                value: client.guildPrefixes[msg.channel.guild.id]
                  ? client.guildPrefixes[msg.channel.guild.id]
                  : client.commandOptions.prefix
              }
            ]
          }
        };
      },
      reactions: ['⬆️', '⬇️', '⏺', '#️⃣', '⏹', '❗']
    });
    menu.addEmoji('serversettings', '⏹', () => {
      menu.setState('default');
      selection = 0;
    });
    menu.addEmoji('serversettings', '⬆️', async () => {
      if (--selection < 0) selection = settings.flags.length - 1;
    });
    menu.addEmoji('serversettings', '⬇️', async () => {
      if (++selection > settings.flags.length - 1) selection = 0;
    });
    menu.addEmoji('serversettings', '⏺', async () => {
      let newSettings = await settings.getValueByID(msg.channel.guild.id);
      let newFlags = settings.getFlags(newSettings.flags);
      if (
        settings.getFlags(newSettings.flags).includes(settings.flags[selection])
      ) {
        delete newFlags[newFlags.indexOf(settings.flags[selection])];
      } else {
        newFlags.push(settings.flags[selection]);
      }
      newSettings.flags = settings.toFlags(newFlags);
      await settings.updateValue({
        id: newSettings.id,
        flags: newSettings.flags,
        RNG: newSettings.RNG
      });
      return;
    });
    menu.addEmoji('serversettings', '#️⃣', () => {
      menu.setState('channelsettings');
      selection = 0;
    });
    menu.addState('changeprefix');
    menu.addEmoji('serversettings', '❗', async (message, user) => {
      menu.setState('changeprefix');
      let newMsg = await message.channel.createMessage(
        'Say what you want the prefix to be surrounded like this: `d!` or `dad ` using this symbol ` (yes you can have spaces in the prefix)'
      );
      async function changePrefix(messag) {
        if (
          messag.author.id !== user.id ||
          messag.channel.id !== message.channel.id
        )
          return;
        client.off('messageCreate', changePrefix);
        let prefix = messag.content.replace(/^`([\s\S]+)`$/, '$1');
        if (prefix === client.commandOptions.prefix) {
          await prefixes.managePrefixes({
            action: 'remove',
            serverID: msg.channel.guild.id
          });
        } else {
          await prefixes.managePrefixes({
            action: 'add',
            prefix,
            serverID: msg.channel.guild.id
          });
        }
        await newMsg.delete();
        await messag.delete();
        menu.setState('serversettings');
      }
      client.on('messageCreate', changePrefix);
    });
    menu.addState('channelsettings', {
      message: async () => {
        let setngs = await settings.getValueByID(channelSelection);
        return {
          embed: {
            title: `Channel Settings for #${
              msg.channel.guild.channels.get(channelSelection).name
            }`,
            description:
              'Use ⬆️ and ⬇️ to select what to change and use ⏺ to toggle your selection! Use #️⃣ to switch to server settings! Use 🔃 to change what channel you are editing! Use ⏹ to go back to the main menu.',
            thumbnail: {
              url: msg.channel.guild.dynamicIconURL(
                msg.channel.guild.icon
                  ? msg.channel.guild.icon.startsWith('a_')
                    ? 'gif'
                    : 'png'
                  : 'png',
                256
              )
            },
            fields: [
              ...settings.flags.map((i, o, s) => {
                return {
                  name: `${selection === o ? '> ' : ''}${i}`,
                  value: `is currently set to \`${
                    settings.getFlags(setngs.flags).includes(i)
                      ? 'ENABLED'
                      : 'DISABLED'
                  }\``
                };
              })
            ]
          }
        };
      },
      reactions: ['⬆️', '⬇️', '⏺', '#️⃣', '⏹', '🔃']
    });
    menu.addEmoji('channelsettings', '⏹', () => {
      menu.setState('default');
      selection = 0;
      channelSelection = menu.message.channel.id;
    });
    menu.addEmoji('channelsettings', '⬆️', async () => {
      if (--selection < 0) selection = settings.flags.length - 1;
    });
    menu.addEmoji('channelsettings', '⬇️', async () => {
      if (++selection > settings.flags.length - 1) selection = 0;
    });
    menu.addEmoji('channelsettings', '#️⃣', () => {
      menu.setState('serversettings');
      selection = 0;
      channelSelection = menu.message.channel.id;
    });
    menu.addEmoji('channelsettings', '⏺', async () => {
      let newSettings = await settings.getValueByID(channelSelection);
      let newFlags = settings.getFlags(newSettings.flags);
      if (
        settings.getFlags(newSettings.flags).includes(settings.flags[selection])
      ) {
        delete newFlags[newFlags.indexOf(settings.flags[selection])];
      } else {
        newFlags.push(settings.flags[selection]);
      }
      newSettings.flags = settings.toFlags(newFlags);
      await settings.updateValue({
        id: newSettings.id,
        flags: newSettings.flags,
        RNG: newSettings.RNG
      });
      return;
    });
    menu.addState('changechannel');
    menu.addEmoji('channelsettings', '🔃', async (message, user) => {
      menu.setState('changechannel');
      let newMsg = await message.channel.createMessage(
        'Mention the channel or send the ID in a message to select a new channel!'
      );
      async function checkChannel(messag) {
        if (
          messag.author.id !== user.id ||
          messag.channel.id !== message.channel.id
        )
          return;
        let chanID = messag.content.replace(/^<?#?(\d+)>? ?$/, '$1');
        if (!message.channel.guild.channels.get(chanID)) {
          await newMsg.edit("That's not a valid channel, try again!");
          await messag.delete();
          setTimeout(
            () =>
              newMsg
                .edit(
                  'Mention the channel or send the ID in a message to select a new channel!'
                )
                .catch(() => {}),
            5000
          );
        } else {
          client.off('messageCreate', checkChannel);
          channelSelection = chanID;
          await newMsg.delete();
          await messag.delete();
          menu.setState('channelsettings');
        }
      }
      client.on('messageCreate', checkChannel);
    });
    menu.addState('usersettings', {
      message: async () => {
        let setngs = await settings.getValueByID(msg.author.id);
        return {
          embed: {
            title: 'User Settings',
            description:
              'Use ⬆️ and ⬇️ to select what to change and use ⏺ to toggle your selection! Use ⏹ to go back to the main menu. PASTA_MODE in this menu means pasta mode Immunity.',
            thumbnail: {
              url: msg.author.dynamicAvatarURL(
                msg.author.avatar
                  ? msg.author.avatar.startsWith('a_')
                    ? 'gif'
                    : 'png'
                  : 'png',
                256
              )
            },
            fields: [
              ...settings.flags.map((i, o, s) => {
                return {
                  name: `${selection === o ? '> ' : ''}${i}`,
                  value: `is currently set to \`${
                    settings.getFlags(setngs.flags).includes(i)
                      ? 'ENABLED'
                      : 'DISABLED'
                  }\``
                };
              })
            ]
          }
        };
      },
      reactions: ['⬆️', '⬇️', '⏺', '⏹']
    });
    menu.addEmoji('usersettings', '⏹', () => {
      menu.setState('default');
      selection = 0;
    });
    menu.addEmoji('usersettings', '⬆️', async () => {
      if (--selection < 0) selection = settings.flags.length - 1;
    });
    menu.addEmoji('usersettings', '⬇️', async () => {
      if (++selection > settings.flags.length - 1) selection = 0;
    });
    menu.addEmoji('usersettings', '⏺', async () => {
      let newSettings = await settings.getValueByID(msg.author.id);
      let newFlags = settings.getFlags(newSettings.flags);
      if (
        settings.getFlags(newSettings.flags).includes(settings.flags[selection])
      ) {
        delete newFlags[newFlags.indexOf(settings.flags[selection])];
      } else {
        newFlags.push(settings.flags[selection]);
      }
      newSettings.flags = settings.toFlags(newFlags);
      await settings.updateValue({
        id: newSettings.id,
        flags: newSettings.flags,
        RNG: newSettings.RNG
      });
      return;
    });
  },

  options: {
    description: 'manage settings here!'
  }
};

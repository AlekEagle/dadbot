import {
  SlashCommand,
  Subcommand,
  OptionBuilder,
} from 'oceanic.js-interactions';

import {
  getGuildSettings,
  getChannelSettings,
  getUserSettings,
  getComputedSettings,
  numberToFlags,
  decimalToFraction,
  defaultSettings,
  getHierarchySettings,
} from '../utils/Settings';
import { isOwner } from '../utils/Owners';

interface DiscordMessageURLMatch {
  guildID: string;
  channelID: string;
  messageID: string;
}

const DISCORD_MSG_URL_REGEX =
  /https?:\/\/(?:canary\.|ptb\.)?discord(?:app)?\.com\/channels\/(\d+)\/(\d+)\/(\d+)/;

function parseDiscordMessageURL(url: string): DiscordMessageURLMatch | null {
  const match = url.match(DISCORD_MSG_URL_REGEX);
  if (!match) return null;
  const [, guildID, channelID, messageID] = match;
  return { guildID, channelID, messageID };
}

const debug = new SlashCommand(
  'debug',
  'Debug command to show the current settings for the guild, channel, and user!',
  {},
);

const debugGuild = new Subcommand(
  'guild',
  'Show the current settings for the guild!',
  {},
  async (interaction) => {
    const message = await interaction.acknowledge(true);

    if (!(await isOwner(interaction.user.id))) {
      message.edit({
        content: 'No.',
      });
      return;
    }

    const settings = await getGuildSettings(interaction.guildID!);

    message.edit({
      embeds: [
        {
          title: 'Guild Settings',
          description: 'Here are the current settings for the guild!',
          fields: [
            {
              name: 'Flags Raw',
              value: `0x${settings.flags.toString(2).padStart(defaultSettings.flags.toString(2).length, '0')}`,
              inline: true,
            },
            {
              name: 'Enabled Flags',
              value: numberToFlags(settings.flags).join(', ') || 'None',
              inline: true,
            },
            {
              name: 'Disabled Flags',
              value:
                numberToFlags(settings.flags ^ defaultSettings.flags).join(
                  ', ',
                ) || 'None',
              inline: true,
            },
            {
              name: 'RNG',
              value: settings.RNG
                ? `${decimalToFraction(settings.RNG)} (${settings.RNG})`
                : 'Default',
              inline: true,
            },
          ],
        },
      ],
    });
  },
);

debug.addSubcommand(debugGuild);

const debugChannel = new Subcommand(
  'channel',
  'Show the current settings for the channel!',
  {},
  async (interaction) => {
    const message = await interaction.acknowledge();

    if (!(await isOwner(interaction.user.id))) {
      message.edit({
        content: 'No.',
      });
      return;
    }

    const settings = await getChannelSettings(interaction.channelID);

    message.edit({
      embeds: [
        {
          title: 'Channel Settings',
          description: 'Here are the current settings for the channel!',
          fields: [
            {
              name: 'Flags Raw',
              value: `0x${settings.flags.toString(2).padStart(defaultSettings.flags.toString(2).length, '0')}`,
              inline: true,
            },
            {
              name: 'Enabled Flags',
              value: numberToFlags(settings.flags).join(', ') || 'None',
              inline: true,
            },
            {
              name: 'Disabled Flags',
              value:
                numberToFlags(settings.flags ^ defaultSettings.flags).join(
                  ', ',
                ) || 'None',
              inline: true,
            },
            {
              name: 'RNG',
              value: settings.RNG
                ? `${decimalToFraction(settings.RNG)} (${settings.RNG})`
                : 'Default',
              inline: true,
            },
          ],
        },
      ],
    });
  },
);

debug.addSubcommand(debugChannel);

const debugUser = new Subcommand(
  'user',
  'Show the current settings for the user!',
  {},
  async (interaction) => {
    const message = await interaction.acknowledge();

    if (!(await isOwner(interaction.user.id))) {
      message.edit({
        content: 'No.',
      });
      return;
    }

    const settings = await getUserSettings(interaction.user.id);

    message.edit({
      embeds: [
        {
          title: 'User Settings',
          description: 'Here are the current settings for the user!',
          fields: [
            {
              name: 'Flags Raw',
              value: `0x${settings.flags.toString(2).padStart(defaultSettings.flags.toString(2).length, '0')}`,
              inline: true,
            },
            {
              name: 'Enabled Flags',
              value: numberToFlags(settings.flags).join(', ') || 'None',
              inline: true,
            },
            {
              name: 'Disabled Flags',
              value:
                numberToFlags(settings.flags ^ defaultSettings.flags).join(
                  ', ',
                ) || 'None',
              inline: true,
            },
            {
              name: 'RNG',
              value: settings.RNG
                ? `${decimalToFraction(settings.RNG)} (${settings.RNG})`
                : 'Default',
              inline: true,
            },
          ],
        },
      ],
    });
  },
);

debug.addSubcommand(debugUser);

const debugComputed = new Subcommand(
  'computed',
  'Show the computed settings for a specific message!',
  {
    message: OptionBuilder.String(
      'A URL of the message to get the computed settings for.',
      true,
    ),
  },
  async (interaction, { message: messageToCheck }) => {
    const parsedURL = parseDiscordMessageURL(messageToCheck);

    if (!parsedURL) {
      const message = await interaction.acknowledge(true);
      message.edit({
        content: 'Invalid message URL provided.',
      });
      return;
    }

    const message = await interaction.acknowledge();

    if (!(await isOwner(interaction.user.id))) {
      message.edit({
        content: 'No.',
      });
      return;
    }
    let fetchedMessage;

    try {
      fetchedMessage = await interaction.client.rest.channels.getMessage(
        parsedURL.channelID,
        parsedURL.messageID,
      );
    } catch (error) {
      message.edit({
        content:
          'Failed to fetch the message. Please ensure the URL or ID is correct.',
      });
      return;
    }

    const hierarchySettings = await getHierarchySettings(
        fetchedMessage,
        parsedURL.guildID,
      ),
      computedSettings = await getComputedSettings(
        fetchedMessage,
        parsedURL.guildID,
      );

    message.edit({
      content: `Computed settings for [this message](${messageToCheck}):`,
      embeds: [
        {
          title: 'User Settings',
          description: 'Here are the computed settings for the message!',
          color:
            hierarchySettings.preferred === 'user'
              ? 0x00ff00
              : hierarchySettings.preferred === 'default'
                ? 0xffff00
                : undefined,
          fields: [
            {
              name: 'Flags Raw',
              value: `0x${hierarchySettings.user.flags.toString(2).padStart(defaultSettings.flags.toString(2).length, '0')}`,
              inline: true,
            },
            {
              name: 'Enabled Flags',
              value:
                numberToFlags(hierarchySettings.user.flags).join(', ') ||
                'None',
              inline: true,
            },
            {
              name: 'Disabled Flags',
              value:
                numberToFlags(
                  hierarchySettings.user.flags ^ defaultSettings.flags,
                ).join(', ') || 'None',
              inline: true,
            },
            {
              name: 'RNG',
              value: hierarchySettings.user.RNG
                ? `${decimalToFraction(hierarchySettings.user.RNG)} (${hierarchySettings.user.RNG})`
                : 'Default',
              inline: true,
            },
            {
              name: 'Is Default',
              value: hierarchySettings.user.default ? 'Yes' : 'No',
              inline: true,
            },
          ],
        },
        {
          title: 'Channel Settings',
          description: 'Here are the channel settings for the message!',
          color:
            hierarchySettings.preferred === 'channel'
              ? 0x00ff00
              : hierarchySettings.preferred === 'default'
                ? 0xffff00
                : undefined,
          fields: [
            {
              name: 'Flags Raw',
              value: `0x${hierarchySettings.channel.flags.toString(2).padStart(defaultSettings.flags.toString(2).length, '0')}`,
              inline: true,
            },
            {
              name: 'Enabled Flags',
              value:
                numberToFlags(hierarchySettings.channel.flags).join(', ') ||
                'None',
              inline: true,
            },
            {
              name: 'Disabled Flags',
              value:
                numberToFlags(
                  hierarchySettings.channel.flags ^ defaultSettings.flags,
                ).join(', ') || 'None',
              inline: true,
            },
            {
              name: 'RNG',
              value: hierarchySettings.channel.RNG
                ? `${decimalToFraction(hierarchySettings.channel.RNG)} (${hierarchySettings.channel.RNG})`
                : 'Default',
              inline: true,
            },
            {
              name: 'Is Default',
              value: hierarchySettings.channel.default ? 'Yes' : 'No',
              inline: true,
            },
          ],
        },
        ...(hierarchySettings.guild
          ? [
              {
                title: 'Guild Settings',
                description: 'Here are the guild settings for the message!',
                color:
                  hierarchySettings.preferred === 'guild'
                    ? 0x00ff00
                    : hierarchySettings.preferred === 'default'
                      ? 0xffff00
                      : undefined,
                fields: [
                  {
                    name: 'Flags Raw',
                    value: `0x${hierarchySettings.guild.flags.toString(2).padStart(defaultSettings.flags.toString(2).length, '0')}`,
                    inline: true,
                  },
                  {
                    name: 'Enabled Flags',
                    value:
                      numberToFlags(hierarchySettings.guild.flags).join(', ') ||
                      'None',
                    inline: true,
                  },
                  {
                    name: 'Disabled Flags',
                    value:
                      numberToFlags(
                        hierarchySettings.guild.flags ^ defaultSettings.flags,
                      ).join(', ') || 'None',
                    inline: true,
                  },
                  {
                    name: 'RNG',
                    value: hierarchySettings.guild.RNG
                      ? `${decimalToFraction(hierarchySettings.guild.RNG)} (${hierarchySettings.guild.RNG})`
                      : 'Default',
                    inline: true,
                  },
                  {
                    name: 'Is Default',
                    value: hierarchySettings.guild.default ? 'Yes' : 'No',
                    inline: true,
                  },
                ],
              },
            ]
          : []),
        {
          title: 'Computed Settings',
          description: 'Here are the final computed settings for the message!',
          fields: [
            {
              name: `Flags Raw (Inherited from ${computedSettings.inheritedFrom.flags})`,
              value: `0x${computedSettings.value.flags.toString(2).padStart(defaultSettings.flags.toString(2).length, '0')}`,
              inline: true,
            },
            {
              name: `Enabled Flags (Inherited from ${computedSettings.inheritedFrom.flags})`,
              value:
                numberToFlags(computedSettings.value.flags).join(', ') ||
                'None',
              inline: true,
            },
            {
              name: `Disabled Flags (Inherited from ${computedSettings.inheritedFrom.flags})`,
              value:
                numberToFlags(
                  computedSettings.value.flags ^ defaultSettings.flags,
                ).join(', ') || 'None',
              inline: true,
            },
            {
              name: `RNG (Inherited from ${computedSettings.inheritedFrom.RNG})`,
              value: computedSettings.value.RNG
                ? `${decimalToFraction(computedSettings.value.RNG)} (${computedSettings.value.RNG})`
                : 'Default',
              inline: true,
            },
          ],
        },
      ],
    });
  },
);

debug.addSubcommand(debugComputed);

export default debug;

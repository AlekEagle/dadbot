import { AnyGuildTextChannel, Constants } from "oceanic.js";
import {
  SlashCommand,
  Subcommand,
  OptionBuilder,
} from "oceanic.js-interactions";
import {
  getChannelSettings,
  setChannelSettings,
  Flags,
  enumToArray,
} from "../utils/Settings";

const channelSettings = new SlashCommand(
  "channelsettings",
  "Manage Dad Bot settings for a channel!",
  {
    defaultMemberPermissions: Constants.Permissions.MANAGE_CHANNELS.toString(),
    dmPermissions: false,
  }
);

const viewChannelSettings = new Subcommand(
  "view",
  "View the current settings for the channel!",
  {
    defaultMemberPermissions: Constants.Permissions.MANAGE_CHANNELS.toString(),
    dmPermissions: false,
  },
  {
    channel: OptionBuilder.Channel(
      "The channel to view the settings for.",
      false
    ),
  },
  async (args, interaction) => {
    const message = await interaction.acknowledge(true);

    // Exclude weird channels
    if (
      args.channel &&
      args.channel?.type !== Constants.ChannelTypes.GUILD_TEXT &&
      args.channel?.type !== Constants.ChannelTypes.GUILD_ANNOUNCEMENT
    ) {
      message.edit({
        content: "You can only view the settings for text channels!",
      });
      return;
    }

    const settings = await getChannelSettings(
      args.channel?.id || interaction.channelID
    );

    const embed = {
      title:
        "Channel Settings for " + (args.channel as AnyGuildTextChannel)?.name ||
        "this channel",
      description:
        "Here are the current settings for the channel, if you need a more detailed explanation of what each setting does, use `/help settings`.",
      fields: [
        ...enumToArray(Flags).map((flag) => ({
          name: flag
            .replace(/_/g, " ")
            .toLowerCase()
            .split(" ")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" "),
          value:
            settings.flags & Flags[flag as keyof typeof Flags]
              ? "Enabled"
              : "Disabled",
          inline: true,
        })),
        {
          name: "Auto Response RNG",
          value:
            settings.RNG === null
              ? "100%"
              : `${Math.floor(settings.RNG * 100)}%`,
        },
      ],
    };

    message.edit({ embeds: [embed] });
  }
);

channelSettings.addSubcommand(viewChannelSettings);

const channelAutoResponseSettings = new Subcommand(
  "autoresponses",
  "Manage The automatic responses from Dad Bot for a channel!",
  {
    defaultMemberPermissions: Constants.Permissions.MANAGE_CHANNELS.toString(),
    dmPermissions: false,
  },
  {
    response: OptionBuilder.String("The response to enable or disable.", true, {
      choices: enumToArray(Flags).map((flag) => ({
        name: flag
          .replace(/_/g, " ")
          .toLowerCase()
          .split(" ")
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" "),
        value: flag,
      })),
    }),
    enabled: OptionBuilder.Boolean(
      "Whether to enable or disable the response.",
      true
    ),
    channel: OptionBuilder.Channel(
      "The channel to change the settings for.",
      false
    ),
  },
  async (args, interaction) => {
    const message = await interaction.acknowledge(true);

    // Exclude weird channels
    if (
      args.channel &&
      args.channel?.type !== Constants.ChannelTypes.GUILD_TEXT &&
      args.channel?.type !== Constants.ChannelTypes.GUILD_ANNOUNCEMENT
    ) {
      message.edit({
        content: "You can only view the settings for text channels!",
      });
      return;
    }

    const settings = await getChannelSettings(
      args.channel?.id || interaction.channelID
    );
    let flags = settings.flags;
    const selectedFlag = Flags[args.response as keyof typeof Flags];
    if (args.enabled) {
      flags |= selectedFlag;
    } else {
      flags &= ~selectedFlag;
    }

    await setChannelSettings(args.channel?.id || interaction.channelID, flags);

    message.edit({
      content: `The \`${args.response
        .replace(/_/g, " ")
        .toLowerCase()
        .split(" ")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ")}\` auto responses have been successfully **${
        args.enabled ? "enabled" : "disabled"
      }**!`,
    });
  }
);

channelSettings.addSubcommand(channelAutoResponseSettings);

const channelRNGSettings = new Subcommand(
  "rng",
  "Manage RNG settings for Dad Bot for a channel!",
  {
    defaultMemberPermissions: Constants.Permissions.MANAGE_CHANNELS.toString(),
    dmPermissions: false,
  },
  {
    percentage: OptionBuilder.Integer(
      "The percentage chance of Dad Bot responding to a message.",
      true,
      {
        minValue: 1,
        maxValue: 100,
      }
    ),
    channel: OptionBuilder.Channel(
      "The channel to change the settings for.",
      false
    ),
  },
  async (args, interaction) => {
    const message = await interaction.acknowledge(true);

    // Exclude weird channels
    if (
      args.channel &&
      args.channel?.type !== Constants.ChannelTypes.GUILD_TEXT &&
      args.channel?.type !== Constants.ChannelTypes.GUILD_ANNOUNCEMENT
    ) {
      message.edit({
        content: "You can only view the settings for text channels!",
      });
      return;
    }

    await setChannelSettings(
      args.channel?.id || interaction.channelID,
      undefined,
      args.percentage / 100
    );

    message.edit({
      content: `Done! All Dad Bot auto responses in ${
        args.channel?.mention || "this channel"
      } will only happen ${args.percentage}% of the time!`,
    });
  }
);

channelSettings.addSubcommand(channelRNGSettings);

const resetChannelSettings = new Subcommand(
  "reset",
  "Reset the settings for a channel!",
  {
    defaultMemberPermissions: Constants.Permissions.MANAGE_CHANNELS.toString(),
    dmPermissions: false,
  },
  {
    channel: OptionBuilder.Channel(
      "The channel to change the settings for.",
      false
    ),
  },
  async (args, interaction) => {
    const message = await interaction.acknowledge(true);

    // Exclude weird channels
    if (
      args.channel &&
      args.channel?.type !== Constants.ChannelTypes.GUILD_TEXT &&
      args.channel?.type !== Constants.ChannelTypes.GUILD_ANNOUNCEMENT
    ) {
      message.edit({
        content: "You can only view the settings for text channels!",
      });
      return;
    }

    await setChannelSettings(args.channel?.id || interaction.channelID);

    message.edit({
      content: `Done! All Dad Bot settings for ${
        args.channel?.mention || "this channel"
      } have been reset!`,
    });
  }
);

channelSettings.addSubcommand(resetChannelSettings);

export default channelSettings;

import { AnyGuildTextChannel, Constants } from "oceanic.js";
import {
  SlashCommand,
  SubcommandGroup,
  Subcommand,
  OptionBuilder,
} from "oceanic.js-interactions";
import {
  getUserSettings,
  getChannelSettings,
  getGuildSettings,
  setChannelSettings,
  setGuildSettings,
  setUserSettings,
  Flags,
  enumToArray,
} from "../utils/Settings";

const settings = new SlashCommand(
  "settings",
  "Change the settings for the bot."
);

const serverSettingsGroup = new SubcommandGroup(
  "server",
  "Manage Dad Bot settings server-wide!",
  {
    defaultMemberPermissions: Constants.Permissions.MANAGE_GUILD.toString(),
    dmPermissions: false,
  }
);

settings.addSubcommandGroup(serverSettingsGroup);

const viewServerSettings = new Subcommand(
  "view",
  "View the current settings for the server!",
  {},
  {},
  async (_, interaction) => {
    const message = await interaction.acknowledge(true);
    const settings = await getGuildSettings(interaction.guildID);
    const embed = {
      title: "Server Settings",
      description:
        "Here are the current settings for the server, if you need a more detailed explanation of what each setting does, use `/help settings`.",
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

serverSettingsGroup.addSubcommand(viewServerSettings);

const serverAutoResponseSettings = new Subcommand(
  "autoresponses",
  "Manage The automatic responses from Dad Bot across the server!",
  {
    defaultMemberPermissions: Constants.Permissions.MANAGE_GUILD.toString(),
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
  },
  async (args, interaction) => {
    const message = await interaction.acknowledge(true);
    const settings = await getGuildSettings(interaction.guildID);
    let flags = settings.flags;
    const selectedFlag = Flags[args.response as keyof typeof Flags];
    if (args.enabled) {
      flags |= selectedFlag;
    } else {
      flags &= ~selectedFlag;
    }

    await setGuildSettings(interaction.guildID, flags);

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

serverSettingsGroup.addSubcommand(serverAutoResponseSettings);

const serverRNGSettings = new Subcommand(
  "rng",
  "Manage RNG settings for Dad Bot across the server!",
  {
    defaultMemberPermissions: Constants.Permissions.MANAGE_GUILD.toString(),
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
  },
  async (args, interaction) => {
    const message = await interaction.acknowledge(true);
    await setGuildSettings(
      interaction.guildID,
      undefined,
      args.percentage / 100
    );

    message.edit({
      content: `Done! All Dad Bot auto responses will only happen ${args.percentage}% of the time!`,
    });
  }
);

serverSettingsGroup.addSubcommand(serverRNGSettings);

const resetServerSettings = new Subcommand(
  "reset",
  "Reset the settings for the server to the default!",
  {
    defaultMemberPermissions: Constants.Permissions.MANAGE_GUILD.toString(),
    dmPermissions: false,
  },
  {},
  async (_, interaction) => {
    const message = await interaction.acknowledge(true);
    await setGuildSettings(interaction.guildID);

    await message.edit({
      content: "Done! The server settings have been reset to the default!",
    });
  }
);

serverSettingsGroup.addSubcommand(resetServerSettings);

const channelSettingsGroup = new SubcommandGroup(
  "channel",
  "Manage Dad Bot settings for a channel!",
  {
    defaultMemberPermissions: Constants.Permissions.MANAGE_CHANNELS.toString(),
    dmPermissions: false,
  }
);

settings.addSubcommandGroup(channelSettingsGroup);

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

channelSettingsGroup.addSubcommand(viewChannelSettings);

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

channelSettingsGroup.addSubcommand(channelAutoResponseSettings);

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

channelSettingsGroup.addSubcommand(channelRNGSettings);

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

channelSettingsGroup.addSubcommand(resetChannelSettings);

const userSettingsGroup = new SubcommandGroup(
  "user",
  "Manage Dad Bot settings for yourself!",
  {
    dmPermissions: true,
  }
);

settings.addSubcommandGroup(userSettingsGroup);

const viewUserSettings = new Subcommand(
  "view",
  "View your current settings!",
  {
    dmPermissions: true,
  },
  {},
  async (_, interaction) => {
    const message = await interaction.acknowledge(true);

    const settings = await getUserSettings(interaction.user.id);

    const embed = {
      title: "Your Dad Bot Settings",
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
          inline: true,
        },
      ],
    };

    message.edit({ embeds: [embed] });
  }
);

userSettingsGroup.addSubcommand(viewUserSettings);

const userAutoResponseSettings = new Subcommand(
  "autoresponses",
  "Manage The automatic responses from Dad Bot for yourself!",
  {
    dmPermissions: true,
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
  },
  async (args, interaction) => {
    const message = await interaction.acknowledge(true);

    const settings = await getUserSettings(interaction.user.id);
    let flags = settings.flags;
    const selectedFlag = Flags[args.response as keyof typeof Flags];
    if (args.enabled) {
      flags |= selectedFlag;
    } else {
      flags &= ~selectedFlag;
    }

    await setUserSettings(interaction.user.id, flags);

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

userSettingsGroup.addSubcommand(userAutoResponseSettings);

const userRNGSettings = new Subcommand(
  "rng",
  "Manage RNG settings for Dad Bot for yourself!",
  {
    dmPermissions: true,
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
  },
  async (args, interaction) => {
    const message = await interaction.acknowledge(true);

    await setUserSettings(
      interaction.user.id,
      undefined,
      args.percentage / 100
    );

    message.edit({
      content: `Done! All Dad Bot auto responses for you will only happen ${args.percentage}% of the time!`,
    });
  }
);

userSettingsGroup.addSubcommand(userRNGSettings);

const resetUserSettings = new Subcommand(
  "reset",
  "Reset your settings!",
  {
    dmPermissions: true,
  },
  {},
  async (_, interaction) => {
    const message = await interaction.acknowledge(true);

    await setUserSettings(interaction.user.id);

    message.edit({
      content: "Done! All of your Dad Bot settings have been reset!",
    });
  }
);

userSettingsGroup.addSubcommand(resetUserSettings);

export default settings;

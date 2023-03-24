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

const serverSettings = new SlashCommand(
  "serversettings",
  "Manage Dad Bot settings server-wide!",
  {
    defaultMemberPermissions: Constants.Permissions.MANAGE_GUILD.toString(),
    dmPermissions: false,
  }
);

const viewServerSettings = new Subcommand(
  "view",
  "View the current settings for the server!",
  {
    defaultMemberPermissions: Constants.Permissions.MANAGE_GUILD.toString(),
    dmPermissions: false,
  },
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

serverSettings.addSubcommand(viewServerSettings);

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

serverSettings.addSubcommand(serverAutoResponseSettings);

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

serverSettings.addSubcommand(serverRNGSettings);

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

serverSettings.addSubcommand(resetServerSettings);

export default serverSettings;

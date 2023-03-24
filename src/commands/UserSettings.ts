import {
  SlashCommand,
  Subcommand,
  OptionBuilder,
} from "oceanic.js-interactions";
import {
  getUserSettings,
  setUserSettings,
  Flags,
  enumToArray,
} from "../utils/Settings";

const userSettings = new SlashCommand(
  "usersettings",
  "Manage Dad Bot settings for yourself!"
);

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

userSettings.addSubcommand(viewUserSettings);

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

userSettings.addSubcommand(userAutoResponseSettings);

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

userSettings.addSubcommand(userRNGSettings);

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

userSettings.addSubcommand(resetUserSettings);

export default userSettings;

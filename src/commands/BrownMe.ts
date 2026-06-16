import {
  disableBrownMe,
  enableBrownMe,
  isBrownMeEnabled,
  getBrownMe,
} from '../utils/BrownMe';
import {
  SlashCommand,
  Subcommand,
  OptionBuilder,
} from 'oceanic.js-interactions';
import { Constants } from 'oceanic.js';
import { client } from '..';

const BrownMe = new SlashCommand(
  'brownme',
  'Automatically give yourself a role when you ping the brown me role.',
  {
    defaultMemberPermissions: Constants.Permissions.MANAGE_ROLES.toString(),
    dmPermissions: false,
  },
);

const BrownMeEnable = new Subcommand(
  'enable',
  'Enable the Brown Me feature for this server.',
  {},
  async (interaction) => {
    const message = await interaction.acknowledge(false);

    // Check if the role exists in the server
    const brownMeStatus = await isBrownMeEnabled(interaction.guildID!);
    let roleID = brownMeStatus.roleID;

    if (brownMeStatus.enabled) {
      message.edit({
        content:
          'The Brown Me feature is already enabled for this server. If you deleted the role, you need to disable and re-enable the feature to get a new role created.',
      });
      return;
    }

    if (!roleID) {
      let newRole;
      try {
        newRole = await client.rest.guilds.createRole(interaction.guildID!, {
          name: 'brown me',
          color: 0x964b00,
          // make sure the role is mentionable
          mentionable: true,
        });

        // Move the role below the bot's highest role
        const botMember = client.guilds
          .get(interaction.guildID!)
          ?.members.get(client.user.id);

        const serverRoles = await client.rest.guilds.getRoles(
          interaction.guildID!,
        );

        const botHighestRole = botMember?.roles
          .map((roleID) => serverRoles.find((role) => role.id === roleID))
          .filter((role) => role)
          .sort((a, b) => b!.position - a!.position)[0];

        if (botHighestRole && newRole.position <= botHighestRole.position) {
          await client.rest.guilds.editRolePositions(interaction.guildID!, [
            { id: newRole.id, position: botHighestRole.position - 1 },
          ]);
        }
      } catch (error) {
        console.error('Error creating Brown Me role:', error);
        message.edit({
          content:
            'There was an error creating the Brown Me role. Please make sure I have the manage roles permission and try again.',
        });
        return;
      }

      await enableBrownMe(interaction.guildID!, newRole.id);
      message.edit({
        content:
          "Brown Me has been enabled for this server! A new role called \"brown me\" has been created, and you will automatically get it when you ping the brown me role.\n\nSome things to know about this feature:\n- Dad will not remove the role once you get it, if you want it removed you will have to remove it yourself.\n- If the role is deleted, you'll have to disable and re-enable the feature to get a new role created.\n- keep the brown me role beneath the bot's highest role, otherwise it won't work.\n- If you no longer want the feature, you can disable it with `/brownme disable`.",
      });
    }
  },
);

BrownMe.addSubcommand(BrownMeEnable);

const BrownMeDisable = new Subcommand(
  'disable',
  'Disable the Brown Me feature for this server.',
  {
    'delete-role': OptionBuilder.Boolean(
      'Whether to delete the Brown Me role when disabling the feature.',
      false,
    ),
  },
  async (interaction, args) => {
    const message = await interaction.acknowledge(false);

    const brownMeStatus = await isBrownMeEnabled(interaction.guildID!);

    if (!brownMeStatus.enabled) {
      message.edit({
        content: 'The Brown Me feature is not enabled for this server.',
      });
      return;
    }

    if (args['delete-role']) {
      if (brownMeStatus.roleID) {
        try {
          await client.rest.guilds.deleteRole(
            interaction.guildID!,
            brownMeStatus.roleID,
          );
          await disableBrownMe(interaction.guildID!);
          message.edit({
            content:
              'Brown Me has been disabled for this server, and the Brown Me role has been deleted.',
          });
        } catch (error) {
          console.error('Error deleting Brown Me role:', error);
          disableBrownMe(interaction.guildID!);
          message.edit({
            content:
              'The Brown Me feature has been disabled, but there was an error deleting the Brown Me role. Please make sure I have the manage roles permission and delete the role manually.',
          });
          return;
        }
      }
    } else {
      await disableBrownMe(interaction.guildID!);
      message.edit({
        content: 'Brown Me has been disabled for this server.',
      });
    }
  },
);

BrownMe.addSubcommand(BrownMeDisable);

export default BrownMe;

import {
  SlashCommand,
  OptionBuilder,
  Subcommand,
  SubcommandGroup,
} from 'oceanic.js-interactions';
import { Constants } from 'oceanic.js';
import { getOptOuts, setOptOuts, Features } from '../utils/FeatureOptOut';

const OptOut = new SlashCommand(
  'optout',
  'Opt out of certain features of Dad Bot.',
  {},
);

const EmbarrassOptOutGroup = new SubcommandGroup(
  'embarrass',
  'Opt out of being embarrassed by the /embarrass command.',
);

const optOutEmbarrassToggle = new Subcommand(
  'set',
  'Opt out of being embarrassed by the /embarrass command.',
  {
    opt_out: OptionBuilder.Boolean(
      'Whether to disable being embarrassed by the /embarrass command.',
      true,
    ),
  },
  async (interaction, { opt_out: optOut }) => {
    const message = await interaction.acknowledge(true);

    const currentOptOuts = await getOptOuts(interaction.user.id);
    const isOptedOut = (currentOptOuts & Features.EMBARRASS) !== 0;

    if (optOut === isOptedOut) {
      await message.edit({
        content: `You are already ${
          optOut ? 'opted out of' : 'opted in to'
        } being embarrassed by the /embarrass command.`,
      });
      return;
    }

    let newOptOuts: Features;
    if (optOut) {
      newOptOuts = currentOptOuts | Features.EMBARRASS;
    } else {
      newOptOuts = currentOptOuts & ~Features.EMBARRASS;
    }
    await setOptOuts(interaction.user.id, newOptOuts);
    await message.edit({
      content: `You have successfully ${optOut ? 'opted out of' : 'opted in to'} being embarrassed by the /embarrass command.`,
    });
  },
);

const optOutEmbarrassStatus = new Subcommand(
  'status',
  'Check whether you are currently opted out of being embarrassed by the /embarrass command.',
  {},
  async (interaction) => {
    const message = await interaction.acknowledge(true);

    const currentOptOuts = await getOptOuts(interaction.user.id);
    const isOptedOut = (currentOptOuts & Features.EMBARRASS) !== 0;

    await message.edit({
      content: `You are currently ${
        isOptedOut ? 'opted out of' : 'opted in to'
      } being embarrassed by the /embarrass command.`,
    });
  },
);

EmbarrassOptOutGroup.addSubcommand(optOutEmbarrassToggle);
EmbarrassOptOutGroup.addSubcommand(optOutEmbarrassStatus);

OptOut.addSubcommandGroup(EmbarrassOptOutGroup);

export default OptOut;

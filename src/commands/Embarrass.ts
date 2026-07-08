import {
  AnnouncementThreadChannel,
  Constants,
  Member,
  ThreadChannel,
} from 'oceanic.js';
import { SlashCommand, OptionBuilder } from 'oceanic.js-interactions';
import { getOptOuts, Features } from '../utils/FeatureOptOut';
import Dadhook from '../utils/Dadhook';
import Lists from '../utils/Lists';
import { client, logger } from '..';

const embarrass = new SlashCommand(
  'embarrass',
  'Embarrass yourself or friends!',
  {
    dmPermissions: false,
  },
  {
    user: OptionBuilder.User('The user to embarrass.', false),
  },
  async (interaction, args) => {
    try {
      await interaction.defer(Constants.MessageFlags.EPHEMERAL);
      if (
        interaction.channel instanceof AnnouncementThreadChannel ||
        interaction.channel instanceof ThreadChannel
      ) {
        await interaction.editOriginal({
          content: "You can't embarrass people in a thread!",
        });
        return;
      }

      const channel = await client.rest.channels.get(interaction.channelID);
      const dadhook = await Dadhook.giveMeDadhook(channel as any);
      const user = args.user ?? interaction.member;

      const currentOptOuts = await getOptOuts(user.id);
      if (
        (currentOptOuts & Features.EMBARRASS) !== 0 &&
        user.id !== interaction.user.id // Allow people to embarrass themselves even if they've opted out of being embarrassed by the /embarrass command.
      ) {
        await interaction.editOriginal({
          content:
            "This user has asked to not be embarrassed by the /embarrass command, so I won't embarrass them.",
        });
        return;
      }

      try {
        const thing =
          Lists.embarrassingThings[
            Math.floor(Math.random() * Lists.embarrassingThings.length)
          ];
        await dadhook.execute({
          // this only works on the legit real dad boob because heck you
          content: `${thing}\n\n-# Don't like being embarassed? </optout embarrass set:1516299518696493057>`,
          username:
            user instanceof Member
              ? user.nick && user.nick.length >= 2
                ? user.nick
                : user.user.globalName || user.user.username
              : user.globalName || user.username,
          avatarURL: user.avatarURL(),
          threadID: channel instanceof ThreadChannel ? channel.id : undefined,
        });

        await interaction.editOriginal({
          content:
            user == interaction.member
              ? "Okay, there, I am embarrassed you, but I still don't know why you'd want to embarrass yourself."
              : 'Okay, there, I am embarrassed a friend for you.',
        });
      } catch (e) {
        logger.error(e);
        await interaction.editOriginal({
          content: `I can't embarrass you${
            user == interaction.member ? '' : 'r friend'
          }, sorry.`,
        });
      }
    } catch (e) {
      logger.error(e);
      interaction.createFollowup({ content: (e as Error).message });
    }
  },
);

export default embarrass;

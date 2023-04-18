import {
  AnnouncementThreadChannel,
  Constants,
  Member,
  ThreadChannel,
} from "oceanic.js";
import { SlashCommand, OptionBuilder } from "oceanic.js-interactions";
import Dadhook from "../utils/Dadhook";
import Lists from "../utils/Lists";
import { client, logger } from "..";

const embarrass = new SlashCommand(
  "embarrass",
  "Embarrass yourself or friends!",
  {
    dmPermissions: false,
  },
  {
    user: OptionBuilder.User("The user to embarrass.", false),
  },
  async (args, interaction) => {
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

      const dadhook = await Dadhook.giveMeDadhook(
        await client.rest.channels.get(interaction.channelID)
      );
      const user = args.user ?? interaction.member;
      dadhook.execute({
        content:
          Lists.embarrassingThings[
            Math.floor(Math.random() * Lists.embarrassingThings.length)
          ],
        username:
          user instanceof Member && user.nick?.length >= 2
            ? user.nick
            : user.username,
        avatarURL: user.avatarURL(),
      });

      await interaction.editOriginal({
        content:
          user == interaction.member
            ? "Okay, there, I am embarrassed you, but I still don't know why you'd want to embarrass yourself."
            : "Okay, there, I am embarrassed a friend for you.",
      });
    } catch (e) {
      logger.error(e);
      interaction.createFollowup({ content: (e as Error).message });
    }
  }
);

export default embarrass;

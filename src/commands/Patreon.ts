import { SlashCommand, Subcommand } from 'oceanic.js-interactions';
import { getSupporterByDiscordID } from '../utils/Patreon';

const patreonBase = new SlashCommand(
  'patreon',
  'Help support Dad Bot and the creator!',
);

const patreonInfo = new Subcommand(
  'info',
  'Get information about the Patreon.',
  {},
  (interaction) => {
    interaction.createMessage({
      content:
        "You like Dad Bot? Help support the creator by supporting him on patreon! This is the 5th major rewrite of the Dad Bot code, it'll help pay for the server the bot runs on. If you want to support the bot, please become a patron at https://patreon.com/alekeagle",
    });
  },
);

patreonBase.addSubcommand(patreonInfo);

const patreonStatus = new Subcommand(
  'status',
  'Get the status of your Patreon membership.',
  {},
  (interaction) => {
    interaction.acknowledge();
    const user = getSupporterByDiscordID(interaction.user.id);
    if (user == null) {
      interaction.createFollowup({
        content:
          "According to Patreon, you aren't a member. If you haven't joined yet, you can [join here](https://patreon.com/alekeagle) and receive your benefits. If you just joined, we periodically fetch the members from Patreon every 30 minutes. If you have been joined for a while, make sure your Discord account is linked to your Patreon account. You can do this by going to [your Patreon connections](https://www.patreon.com/settings/apps) and linking your Discord account.",
      });
      return;
    } else {
      interaction.createFollowup({
        content: `You are a ${user.status} member of the Dad Bot Patreon. Thank you for your support! (Note: Only active members receive benefits.)`,
      });
    }
  },
);

patreonBase.addSubcommand(patreonStatus);

export default patreonBase;

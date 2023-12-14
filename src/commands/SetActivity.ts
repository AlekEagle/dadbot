import { SlashCommand, OptionBuilder } from 'oceanic.js-interactions';
import { cluster } from '..';
import { isOwner } from '../utils/Owners';

const setActivity = new SlashCommand(
  'setactivity',
  "Set Dad Bot's current activity (Bot owner only)",
  {},
  {
    status: OptionBuilder.String("Dad Bot's Status", true, {
      choices: [
        {
          name: 'Online',
          value: 'online',
        },
        {
          name: 'Idle',
          value: 'idle',
        },
        {
          name: 'Do Not Disturb',
          value: 'dnd',
        },
        {
          name: 'Offline',
          value: 'invisible',
        },
      ],
    }),
    text: OptionBuilder.String('What Dad is playing', true),
    type: OptionBuilder.Integer('Type of activity', true, {
      choices: [
        {
          name: 'Playing',
          value: 0,
        },
        {
          name: 'Streaming',
          value: 1,
        },
        {
          name: 'Listening to',
          value: 2,
        },
        {
          name: 'Watching',
          value: 3,
        },
        {
          name: 'Competing in',
          value: 5,
        },
      ],
    }),
    url: OptionBuilder.String('The url Dad is streaming to', false),
  },
  async (interaction, { status, text, type, url }) => {
    await interaction.acknowledge();

    if (!(await isOwner(interaction.user.id))) {
      await interaction.createFollowup({
        content: 'No.',
      });
      return;
    }
    let result = await cluster.startCCC(
      'all',
      `client.editStatus('${status}',[${JSON.stringify({
        type,
        name: text,
        url,
      })}])`,
    );

    console.log(result);

    await interaction.createFollowup({
      content: 'Ok.',
    });
  },
);

export default setActivity;

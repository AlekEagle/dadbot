import { SlashCommand } from 'oceanic.js-interactions';
import { Flags } from '../utils/Settings';
import { cluster } from '..';

const Stats = new SlashCommand(
  'stats',
  'Get stats about user statistics.',
  {},
  {},
  async (interaction) => {
    let clusterData: {
      id: number;
      msgCount: number;
      responseCount: number;
      commandCount: number;
      barbecuesServed: number;
      commandStats: Record<string, number>;
      responseStats: Record<Flags, number>;
    }[] = [];
    clusterData = (
      (
        await cluster.startCCC(
          'all',
          `import { getData } from './utils/Statistics';
return JSON.stringify(
  {
    id: process.env.NODE_APP_INSTANCE,
    ...getData()
  }
)`,
        )
      ).data as string[]
    ).map((a: string) => JSON.parse(a));
    interaction.createMessage({
      content: 'Support Server:\n<https://alekeagle.com/d>',
      embeds: [
        {
          title: 'Dad Bot Stats',
          description: 'All of the user statistics about Dad Bot!',
          fields: [
            {
              name: 'Messages Processed',
              value: clusterData
                .map((v) => v.msgCount)
                .reduce((a, b) => a + b, 0)
                .toLocaleString(),
              inline: true,
            },
            {
              name: 'Auto Responses Issued',
              value: clusterData
                .map((v) => v.responseCount)
                .reduce((a, b) => a + b, 0)
                .toString(),
              inline: true,
            },
            {
              name: 'Commands Used (Broken lol)',
              value: clusterData
                .map((v) => v.commandCount)
                .reduce((a, b) => a + b, 0)
                .toLocaleString(),
              inline: true,
            },
            {
              name: 'Barbecues Served',
              value: clusterData
                .map((v) => v.barbecuesServed)
                .reduce((a, b) => a + b, 0)
                .toLocaleString(),
              inline: true,
            },
          ],
        },
        {
          title: 'Auto Response Stats',
          description: 'All of the auto response statistics about Dad Bot!',
          fields: Object.entries(
            clusterData
              .map((v) => v.responseStats)
              .reduce(
                (a, b) => {
                  Object.entries(b).forEach((v: any) => {
                    const boob: [Flags, number] = v;
                    if (a[boob[0]] === undefined) a[boob[0]] = 0;
                    a[boob[0]] += boob[1];
                  });
                  return a;
                },
                {} as Record<Flags, number>,
              ),
          ).map((v: any) => {
            const boob: [Flags, number] = v;
            return {
              name: Flags[boob[0]],
              value: boob[1].toLocaleString(),
              inline: true,
            };
          }),
        },
      ],
    });
  },
);

export default Stats;

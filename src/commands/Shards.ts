import { SlashCommand } from 'oceanic.js-interactions';
import Table from '../utils/Table';
import { client, cluster } from '..';

const Shards = new SlashCommand(
  'shards',
  'Get information about the shards running the bot.',
  {},
  {},
  async (interaction) => {
    interaction.acknowledge();

    let shardsArr: {
      id: number;
      guildCount: number;
      userCount: number;
      status: string;
      ping: number;
    }[] = [];
    // Get the shard data from all shards
    let rawData = await cluster.startCCC(
      'all',
      `return JSON.stringify(
          client.shards.map(s => {
            return {
              id: s.id,
              guildCount: s.client.guilds.filter(g => g.shard.id === s.id).length,
              userCount: s.client.guilds
                .filter(g => g.shard.id === s.id)
                .map(g => g.memberCount)
                .reduce((a, b) => a + b, 0),
              status: s.status.toUpperCase(),
              ping: s.latency,
            }
        })
      )`,
    );
    // Parse the data
    (rawData.data as string[]).forEach((a) => {
      let json = JSON.parse(a);
      json.forEach((b: any) => {
        shardsArr.push(b);
      });
    });

    // Create a table with the data
    let table = new Table(
      {
        'Shard ID': () =>
          shardsArr.map(
            (a) => `${a.id === interaction.guild.shard.id ? '> ' : ''}${a.id}`,
          ),
        'Guild Count': shardsArr.map((a) => a.guildCount.toLocaleString()),
        'User Count': shardsArr.map((a) => a.userCount.toLocaleString()),
        'Status': shardsArr.map((a) => a.status),
        'Ping': shardsArr.map((a) => `${a.ping} ms`),
      },
      {
        totals: (data): string[] => {
          let finalData: string[] = [];
          Object.entries(data).forEach((v: [string, any]) => {
            switch (v[0]) {
              case 'Guild Count':
              case 'User Count':
                finalData.push(
                  shardsArr
                    .map(
                      (a) =>
                        a[v[0] === 'Guild Count' ? 'guildCount' : 'userCount'],
                    )
                    .reduce((a: number, b: number) => a + b, 0)
                    .toLocaleString(),
                );
                break;
              case 'Status':
                let overallShardStatus = shardsArr
                  .map((a) => a.status)
                  .map((a: string) =>
                    a === 'READY' ? '🟢' : a === 'DISCONNECTED' ? '🔴' : '🟡',
                  );
                let statusCount = overallShardStatus.reduce(
                  (acc: { [key: string]: number }, status: string) => {
                    acc[status] = (acc[status] || 0) + 1;
                    return acc;
                  },
                  {},
                );
                finalData.push(
                  Object.entries(statusCount)
                    .map((a) => `${a[0]}: ${a[1]}`)
                    .join(', '),
                );
                break;
              case 'Ping':
                finalData.push(
                  `AVG: ${
                    Math.round(
                      (shardsArr
                        .map((a) => a.ping)
                        .filter((a: number) => !isNaN(a))
                        .reduce((a: number, b: number) => a + b, 0) /
                        shardsArr
                          .map((a) => a.ping)
                          .filter((a: number) => !isNaN(a)).length) *
                        100,
                    ) / 100
                  } ms`,
                );
                break;
              case 'Shard ID':
                finalData.push('Total');
            }
          });
          return finalData;
        },
      },
    );

    // Send the table to the channel in chunks of 2000 characters
    let outMessages: string[] = [],
      row = 0;
    table.rows.forEach((r) => {
      if (outMessages[row] === undefined) outMessages[row] = r;
      else if ((outMessages[row] + `\n${r}`).length + 8 > 2000)
        outMessages[++row] = r;
      else outMessages[row] += `\n${r}`;
    });
    try {
      outMessages.forEach((a, i) => {
        if (i === 0)
          interaction.createFollowup({
            content: `\`\`\`md\n${a}\n\`\`\``,
          });
        else
          client.rest.channels.createMessage(interaction.channelID, {
            content: `\`\`\`md\n${a}\n\`\`\``,
          });
      });
    } catch (e) {
      console.error(e);
      interaction.createFollowup({
        content: 'An error occurred while sending the shard data tables.',
      });
    }
  },
);

export default Shards;

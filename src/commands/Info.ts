import { SlashCommand } from 'oceanic.js-interactions';
import { TextableChannel } from 'oceanic.js';
import { client, cluster } from '..';
import CPU from '../utils/CPU';
import Memory from '../utils/Memory';
import ReadableTime from '../utils/ReadableTime';

const info = new SlashCommand(
  'info',
  'Get info about the bot.',
  {},
  {},
  async (interaction) => {
    let clusterData: {
      id: number;
      guildCount: number;
      userCount: number;
      ping: number;
      shardCount: number;
      msgCount: number;
      responseCount: number;
      commandCount: number;
      barbecuesServed: number;
    }[] = [];
    clusterData = (
      (
        await cluster.startCCC(
          'all',
          `import { getData } from './utils/Statistics';
return JSON.stringify(
  {
    id: process.env.NODE_APP_INSTANCE,
    guildCount: client.guilds.size,
    userCount: client.guilds.map(g => g.memberCount).reduce((a, b) => a + b, 0),
    ping: client.shards.map(s => s.latency).reduce((a, b) => a + b, 0) / client.shards.size,
    shardCount: client.shards.size,
    ...getData()
  }
)`,
        )
      ).data as string[]
    ).map((a: string) => JSON.parse(a));
    let time = new ReadableTime(process.uptime() * 1000);
    let cpu = await CPU();
    interaction.createMessage({
      content: 'Support server:\ndiscord.gg/alek-s-cult-456542159210807307',
      embeds: [
        {
          title: 'Dad Bot Info',
          description: 'All of the general info about Dad Bot!',
          thumbnail: { url: client.user.avatarURL() },
          fields: [
            {
              name: 'Uptime',
              value: time.toShorthand(),
              inline: true,
            },
            {
              name: 'Memory Usage',
              value: new Memory().stringify(),
              inline: true,
            },
            {
              name: 'CPU Usage',
              value: `${cpu}%`,
              inline: true,
            },
            {
              name: 'Users',
              value: clusterData
                .map((v) => v.userCount)
                .reduce((a, b) => a + b, 0)
                .toLocaleString(),
              inline: true,
            },
            {
              name: 'Servers',
              value: clusterData
                .map((v) => v.guildCount)
                .reduce((a, b) => a + b, 0)
                .toLocaleString(),
              inline: true,
            },
            {
              name: 'Messages Processed',
              value: clusterData
                .map((v) => v.msgCount)
                .reduce((a, b) => a + b, 0)
                .toLocaleString(),
              inline: true,
            },
            {
              name: 'Auto responses Issued',
              value: clusterData
                .map((v) => v.responseCount)
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
            {
              name: 'Commands Used',
              value: clusterData
                .map((v) => v.commandCount)
                .reduce((a, b) => a + b, 0)
                .toLocaleString(),
              inline: true,
            },
            {
              name: 'AVG Ping',
              value:
                (
                  clusterData.map((v) => v.ping).reduce((a, b) => a + b, 0) /
                  clusterData.length
                ).toLocaleString() + ' ms',
              inline: true,
            },
            {
              name: 'Total Shards',
              value: clusterData
                .map((v) => v.shardCount)
                .reduce((a, b) => a + b, 0)
                .toLocaleString(),
              inline: true,
            },
            {
              name: 'Total Clusters',
              value: clusterData.length.toLocaleString(),
              inline: true,
            },
            {
              name: 'Current Cluster',
              value: process.env.CLUSTER_ID,
              inline: true,
            },
            {
              name: 'Current Shard',
              value:
                interaction.guildID !== undefined
                  ? interaction.guild.shard.id.toString()
                  : '0',
              inline: true,
            },
          ],
        },
      ],
    });
  },
);

export default info;

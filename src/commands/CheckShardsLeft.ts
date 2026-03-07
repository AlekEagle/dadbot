import { SlashCommand, OptionBuilder } from 'oceanic.js-interactions';
import { client, token } from '..';
import { isOwner } from '../utils/Owners';
import { getShardAllocation } from '../utils/ShardAllocator';

const checkShardsLeft = new SlashCommand(
  'checkshardsleft',
  'Check how many shards are left to spawn (Bot owner only)',
  {},
  {
    force: OptionBuilder.Boolean('Get fresh shard allocation details', false),
  },
  async (interaction, { force }) => {
    await interaction.acknowledge();

    if (!(await isOwner(interaction.user.id))) {
      interaction.createFollowup({
        content: 'No.',
      });
      return;
    }

    const allocation = await getShardAllocation({
      token,
      clusterID: parseInt(process.env.CLUSTER_ID!, 10),
      clusters: parseInt(process.env.CLUSTERS!, 10),
      force,
    });

    interaction.createFollowup({
      embeds: [
        {
          title: 'Shard Allocation',
          author: {
            name: client.user!.username,
            iconURL: client.user!.avatarURL(),
          },
          fields: [
            {
              name: 'Total Shards',
              value: process.env.SHARD_OVERRIDE
                ? `${allocation.total} (Overridden by SHARD_OVERRIDE on this cluster)`
                : `${allocation.total}`,
              inline: true,
            },
            {
              name: 'Shard Allocation Recommended by Discord (All Clusters)',
              value: `${allocation.recommended}`,
              inline: true,
            },
            {
              name: 'Sessions',
              value: `${allocation.totalSessions} total, ${allocation.remainingSessions} remaining.`,
              inline: true,
            },
            {
              name: 'Max Concurrent Sessions',
              value: `${allocation.maxConcurrent}`,
              inline: true,
            },
            {
              name: 'Sessions Resets In',
              value: `${Math.round(allocation.resetsIn / 1000)} seconds or at ${new Date(Date.now() + allocation.resetsIn).toLocaleTimeString()}.`,
              inline: true,
            },
          ],
          footer: {
            text: `Data fetched at ${allocation.timestamp.toLocaleTimeString()}. Use the "force" option to get fresh data from Discord's API.`,
          },
        },
        {
          title: 'All Clusters Shard Allocation',
          fields: allocation.allClusters.map((cluster, index) => ({
            name: `Cluster ${index}${process.env.CLUSTER_ID === index.toString() ? ' (This Cluster)' : ''}`,
            value: `Shards ${cluster.start}-${cluster.end} (${cluster.count} shards managed by this cluster)`,
            inline: false,
          })),
        },
      ],
    });
  },
);

export default checkShardsLeft;

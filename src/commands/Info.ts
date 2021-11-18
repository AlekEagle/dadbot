import Eris from 'eris';
import { CommandModule } from '../types';
import CPU from '../utils/CPU';
import Memory from '../utils/Memory';
import ReadableTime from '../utils/ReadableTime';

const Info: CommandModule = {
  name: 'info',

  async handler(client, msg, args) {
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
      await (process as any).clusterClient.startCCC(
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
)`
      )
    ).data.map((a: string) => JSON.parse(a));
    let time = new ReadableTime(process.uptime() * 1000);
    let cpu = await CPU();
    return {
      embed: {
        title: 'Dad Bot Info',
        description: 'All of the general info about Dad Bot!',
        thumbnail: { url: client.user.dynamicAvatarURL() },
        fields: [
          {
            name: 'Uptime',
            value: time.toShorthand(),
            inline: true
          },
          {
            name: 'Memory Usage',
            value: new Memory().stringify(),
            inline: true
          },
          {
            name: 'CPU Usage',
            value: `${isFinite(cpu) ? cpu : 100}%`,
            inline: true
          },
          {
            name: 'Users',
            value: clusterData
              .map(v => v.userCount)
              .reduce((a, b) => a + b, 0)
              .toLocaleString(),
            inline: true
          },
          {
            name: 'Servers',
            value: clusterData
              .map(v => v.guildCount)
              .reduce((a, b) => a + b, 0)
              .toLocaleString(),
            inline: true
          },
          {
            name: 'Messages Processed',
            value: clusterData
              .map(v => v.msgCount)
              .reduce((a, b) => a + b, 0)
              .toLocaleString(),
            inline: true
          },
          {
            name: 'Auto responses Issued',
            value: clusterData
              .map(v => v.responseCount)
              .reduce((a, b) => a + b, 0)
              .toLocaleString(),
            inline: true
          },
          {
            name: 'Barbecues Served',
            value: clusterData
              .map(v => v.barbecuesServed)
              .reduce((a, b) => a + b, 0)
              .toLocaleString(),
            inline: true
          },
          {
            name: 'Commands Used',
            value: clusterData
              .map(v => v.commandCount)
              .reduce((a, b) => a + b, 0)
              .toLocaleString(),
            inline: true
          },
          {
            name: 'AVG Ping',
            value:
              (
                clusterData.map(v => v.ping).reduce((a, b) => a + b, 0) /
                clusterData.length
              ).toLocaleString() + ' ms',
            inline: true
          },
          {
            name: 'Total Shards',
            value: clusterData
              .map(v => v.shardCount)
              .reduce((a, b) => a + b, 0)
              .toLocaleString(),
            inline: true
          },
          {
            name: 'Total Clusters',
            value: clusterData.length.toLocaleString(),
            inline: true
          },
          {
            name: 'Current Cluster',
            value: process.env.NODE_APP_INSTANCE,
            inline: true
          },
          {
            name: 'Current Shard',
            value: ((msg.channel as Eris.GuildTextableChannel).guild
              ? (msg.channel as Eris.GuildTextableChannel).guild.shard.id
              : 0
            ).toLocaleString(),
            inline: true
          }
        ]
      }
    };
  }
};

export default Info;

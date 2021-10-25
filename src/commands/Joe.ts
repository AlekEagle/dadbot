import { CommandModule } from '../types';
import Table from '../utils/Table';

const __command: CommandModule = {
  name: 'test',

  async handler(client, msg, args) {
    let shardsArr: {
      id: number;
      guildCount: number;
      userCount: number;
      status: string;
      ping: number;
    }[] = [];
    (process as any).clusterClient
      .startCCC(
        'all',
        `return JSON.stringify(
  client.shards.map(s => {
    return {id: s.id, guildCount: s.client.guilds.filter(g => g.shard.id === s.id).length, userCount: s.client.guilds.filter(g => g.shard.id === s.id).map(g => g.memberCount).reduce((a, b) => a + b, 0), status: s.status.toUpperCase(), ping: s.latency}
  })
)`
      )
      .then((data: any) => {
        let json = JSON.parse(data.data);
        json.forEach((a: any) => {
          shardsArr.push(a);
        });

        let table = new Table(
          {
            'ID': shardsArr.map(a => a.id),
            'Guild Count': shardsArr.map(a => a.guildCount),
            'User Count': shardsArr.map(a => a.userCount),
            'Status': shardsArr.map(a => a.status),
            'Ping': shardsArr.map(a => `${a.ping} ms`)
          },
          {
            totals: (data): string[] => {
              let finalData: string[] = [];
              Object.entries(data).forEach(v => {
                switch (v[0]) {
                  case 'Guild Count':
                  case 'User Count':
                    finalData.push(
                      v[1].reduce((a: number, b: number) => a + b, 0).toString()
                    );
                    break;
                  case 'Status':
                    let overallShardStatus = v[1].map((a: string) =>
                      a.substr(0, 1)
                    );
                    let statusCounts: { [key: string]: number } = {};
                    overallShardStatus.forEach(s => {
                      if (statusCounts[s] === undefined) statusCounts[s] = 1;
                      else ++statusCounts[s];
                    });
                    finalData.push(
                      Object.entries(statusCounts)
                        .map(a => `${a[0]}: ${a[1]}`)
                        .join(', ')
                    );
                    break;
                  case 'Ping':
                    finalData.push(
                      `AVG ${(
                        (v[1]
                          .map(a =>
                            parseInt((a as string).replace(/ [a-z]/gi, ''))
                          )
                          .reduce(
                            (a: number, b: number) => a + b,
                            0
                          ) as number) / v[1].length
                      ).toString()} ms`
                    );
                    break;
                  default:
                    finalData.push('N/A');
                    break;
                }
              });
              return finalData;
            }
          }
        );
        msg.channel.createMessage(`\`\`\`${table.text}\`\`\``);
      });
  },

  options: {
    guildOnly: true
  }
};

export default __command;

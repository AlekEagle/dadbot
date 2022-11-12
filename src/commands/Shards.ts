import Eris from "eris";
import Table from "../utils/Table";
import { cluster } from "..";

const Shards: CommandModule = {
  name: "shards",

  async handler(msg, args) {
    let shardsArr: {
      id: number;
      guildCount: number;
      userCount: number;
      status: string;
      ping: number;
    }[] = [];
    cluster
      .startCCC(
        "all",
        `return JSON.stringify(
  client.shards.map(s => {
    return {id: s.id, guildCount: s.client.guilds.filter(g => g.shard.id === s.id).length, userCount: s.client.guilds.filter(g => g.shard.id === s.id).map(g => g.memberCount).reduce((a, b) => a + b, 0), status: s.status.toUpperCase(), ping: s.latency}
  })
)`
      )
      .then((data: any) => {
        (data.data as string[]).forEach((a) => {
          let json = JSON.parse(a);
          json.forEach((b: any) => {
            shardsArr.push(b);
          });
        });

        shardsArr = shardsArr.filter(
          (a, i, s) => s.findIndex((e) => e.id === a.id) === i
        );

        let table = new Table(
          {
            "Shard ID": () =>
              shardsArr.map(
                (a) =>
                  `${
                    a.id ===
                    (msg.channel as Eris.GuildTextableChannel).guild.shard.id
                      ? "> "
                      : ""
                  }${a.id}`
              ),
            "Guild Count": shardsArr.map((a) => a.guildCount),
            "User Count": shardsArr.map((a) => a.userCount),
            Status: shardsArr.map((a) => a.status),
            Ping: shardsArr.map((a) => `${a.ping} ms`),
          },
          {
            totals: (data): string[] => {
              let finalData: string[] = [];
              Object.entries(data).forEach((v) => {
                switch (v[0]) {
                  case "Guild Count":
                  case "User Count":
                    finalData.push(
                      v[1].reduce((a: number, b: number) => a + b, 0).toString()
                    );
                    break;
                  case "Status":
                    let overallShardStatus = v[1].map((a: string) =>
                      a.substr(0, 1)
                    );
                    let statusCounts: { [key: string]: number } = {};
                    overallShardStatus.forEach((s) => {
                      if (statusCounts[s] === undefined) statusCounts[s] = 1;
                      else ++statusCounts[s];
                    });
                    finalData.push(
                      Object.entries(statusCounts)
                        .map((a) => `${a[0]}: ${a[1]}`)
                        .join(", ")
                    );
                    break;
                  case "Ping":
                    finalData.push(
                      `AVG ${(
                        (v[1]
                          .map((a) =>
                            parseInt((a as string).replace(/ [a-z]/gi, ""))
                          )
                          .filter((a) => !!a)
                          .reduce(
                            (a: number, b: number) => a + b,
                            0
                          ) as number) / v[1].length
                      ).toString()} ms`
                    );
                    break;
                  case "Shard ID":
                    finalData.push("TOTAL");
                    break;
                }
              });
              return finalData;
            },
          }
        );
        let outMessages: string[] = [],
          rowInd = 0;
        table.rows.forEach((row) => {
          if (outMessages[rowInd] === undefined) {
            outMessages[rowInd] = row;
          } else {
            if ((outMessages[rowInd] + `\n${row}`).length + 8 > 2000) {
              outMessages[++rowInd] = row;
            } else outMessages[rowInd] += `\n${row}`;
          }
        });
        outMessages.forEach((a) => {
          msg.channel.createMessage(`\`\`\`${a}\`\`\``);
        });
      });
  },

  options: {
    guildOnly: true,
    description: "Shows the shards of the bot!",
  },
};

export default Shards;

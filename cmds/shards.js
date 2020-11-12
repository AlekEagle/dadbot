'use strict';

const Map = require('collections/map');

module.exports = {
  name: 'shards',

  exec: (client, msg, args) => {
    let shards,
      shardsArr = [],
      i = 0;

    function getData() {
      return new Promise((resolve, reject) => {
        grafana.remoteEval(i, 'JSON.stringify(client.shards.map(s => { return [s.id, { id: s.id, guildCount: s.client.guilds.filter(g => g.shard.id === s.id).length, userCount: s.client.guilds.filter(g => g.shard.id === s.id).map(g => g.memberCount).reduce((a, b) => a + b, 0), status: s.status.toUpperCase(), ping: s.latency }] }))').then(res => {
          shardsArr.push(...JSON.parse(res));
          if (++i < Number(process.env.instances)) getData().then(resolve);
          else resolve();
        }, reject);
      });
    }

    getData().then(() => {
      shards = new Map(shardsArr);
      let e = shards.map((s) => s.status.toUpperCase().charAt(0));
      let overallShardStatus = {};
      for (let i = 0; i < e.length; i++) {
        if (!overallShardStatus[e[i]]) overallShardStatus[e[i]] = 0;
        overallShardStatus[e[i]]++;
      }
      let currentShard = msg.channel.type === 1 ? 0 : msg.channel.guild.shard.id,
        curInd = 0;
      let output = [
        `SHARD|GUILDS |USERS  |STATUS${Object.keys(overallShardStatus)
          .map((k) => `${k}: ${overallShardStatus[k]}`)
          .join(", ").length >=
          shards
            .map((s) => s.status.length)
            .sort((a, b) => a - b)
            .reverse()[0]
          ? Object.keys(overallShardStatus)
            .map((k) => `${k}: ${overallShardStatus[k]}`)
            .join(", ").length < 6
            ? ""
            : " ".repeat(
              Object.keys(overallShardStatus)
                .map((k) => `${k}: ${overallShardStatus[k]}`)
                .join(", ").length - 6
            )
          : shards
            .map((s) => s.status.length)
            .sort((a, b) => a - b)
            .reverse()[0] < 6
            ? ""
            : " ".repeat(
              shards
                .map((s) => s.status.length)
                .sort((a, b) => a - b)
                .reverse()[0] - 6
            )
        }|PING     \n-----+-------+-------+------${Object.keys(overallShardStatus)
          .map((k) => `${k}: ${overallShardStatus[k]}`)
          .join(", ").length >=
          shards
            .map((s) => s.status.length)
            .sort((a, b) => a - b)
            .reverse()[0]
          ? Object.keys(overallShardStatus)
            .map((k) => `${k}: ${overallShardStatus[k]}`)
            .join(", ").length < 6
            ? ""
            : "-".repeat(
              Object.keys(overallShardStatus)
                .map((k) => `${k}: ${overallShardStatus[k]}`)
                .join(", ").length - 6
            )
          : shards
            .map((s) => s.status.length)
            .sort((a, b) => a - b)
            .reverse()[0] < 6
            ? ""
            : "-".repeat(
              shards
                .map((s) => s.status.length)
                .sort((a, b) => a - b)
                .reverse()[0] - 6
            )
        }+------`,
      ];
      shards
        .map(
          (s) =>
            `${" ".repeat(
              5 -
              (s.id === currentShard
                ? `>${s.id}`.length
                : s.id.toString().length)
            )}${s.id === currentShard ? `>${s.id}` : s.id}|${s.guildCount
            }${" ".repeat(
              7 -
              s.guildCount.toString()
                .length
            )}|${s.userCount
            }${" ".repeat(
              7 -
              s.userCount.toString().length
            )}|${s.status.toUpperCase()}${Object.keys(overallShardStatus)
              .map((k) => `${k}: ${overallShardStatus[k]}`)
              .join(", ").length <=
              shards
                .map((s) => s.status.length)
                .sort((a, b) => a - b)
                .reverse()[0]
              ? shards
                .map((s) => s.status.length)
                .sort((a, b) => a - b)
                .reverse()[0] < 6
                ? " ".repeat(
                  6 -
                  shards
                    .map((s) => s.status.length)
                    .sort((a, b) => a - b)
                    .reverse()[0]
                )
                : " ".repeat(
                  shards
                    .map((s) => s.status.length)
                    .sort((a, b) => a - b)
                    .reverse()[0] - s.status.toUpperCase().length
                )
              : " ".repeat(
                6 -
                Object.keys(overallShardStatus)
                  .map((k) => `${k}: ${overallShardStatus[k]}`)
                  .join(", ").length -
                shards
                  .map((s) => s.status.length)
                  .sort((a, b) => a - b)
                  .reverse()[0]
              )
            }|${s.ping !== Infinity ? `${s.ping}ms` : "N/A"}${" ".repeat(
              `${s.ping}ms`.length > 9
                ? 9 - "N/A".length
                : 9 - `${s.ping}ms`.length
            )}`
        )
        .forEach((e) => {
          if ((output[curInd] + e).length >= 2000) {
            output[++curInd] = e;
          } else {
            output[curInd] += "\n" + e;
          }
        });
      let totals = `TOTAL|${shards.map(s => s.guildCount).reduce((a, b) => a + b, 0)}${" ".repeat(
        7 - shards.map(s => s.guildCount).reduce((a, b) => a + b, 0).toString().length
      )}|${shards.map(s => s.userCount).reduce((a, b) => a + b, 0).toString()}${" ".repeat(
        7 - shards.map(s => s.userCount).reduce((a, b) => a + b, 0).toString().length
      )}|${Object.keys(overallShardStatus)
        .map((k) => `${k}: ${overallShardStatus[k]}`)
        .join(", ")}${shards
          .map((s) => s.status.length)
          .sort((a, b) => a - b)
          .reverse()[0] >=
          Object.keys(overallShardStatus)
            .map((k) => `${k}: ${overallShardStatus[k]}`)
            .join(", ").length
          ? Object.keys(overallShardStatus)
            .map((k) => `${k}: ${overallShardStatus[k]}`)
            .join(", ").length < 6
            ? " ".repeat(
              6 -
              Object.keys(overallShardStatus)
                .map((k) => `${k}: ${overallShardStatus[k]}`)
                .join(", ").length
            )
            : " ".repeat(
              shards
                .map((s) => s.status.length)
                .sort((a, b) => a - b)
                .reverse()[0] -
              Object.keys(overallShardStatus)
                .map((k) => `${k}: ${overallShardStatus[k]}`)
                .join(", ").length
            )
          : " ".repeat(
            shards
              .map((s) => s.status.length)
              .sort((a, b) => a - b)
              .reverse()[0] -
            Object.keys(overallShardStatus)
              .map((k) => `${k}: ${overallShardStatus[k]}`)
              .join(", ").length
          )
        }|AVG ${Math.round(
          (100 *
            shards
              .map((s) => s.ping)
              .filter((a) => a !== Infinity)
              .reduce((a, b) => a + b, 0)) /
          shards.map((e) => e.ping).filter((a) => a !== Infinity)
            .length
        ) / 100
        }ms`;
      if ((output[curInd] + totals).length >= 2000) {
        output[++curInd] = totals;
      } else {
        output[curInd] += "\n" + totals;
      }
      output.forEach((a) => msg.channel.createMessage(`\`\`\`${a}\`\`\``));
    });

  },

  options: {
    description: "Show other shards info",
    fullDescription: "Show other shards info",
  },
}
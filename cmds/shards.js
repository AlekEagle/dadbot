"use strict";

const Map = require('collections/map');

module.exports = {
  name: "shards",

  exec: (client, msg, args) => {
    let shards,
      shardsArr = [];
    async function getShardsFromClusters(num) {
      return new Promise((resolve, reject) => {
        grafana.remoteEval(num, 'JSON.stringify(Array.from(client.shards.entries()))').then(out => {
          let json;
          try {
            json = JSON.parse(out);
          } catch (err) {
            reject(err);
          }
          shardsArr = [...shardsArr, ...json];
          if (++num < Number(process.env.instances)) getShardsFromClusters(num).then(() => resolve());
          else {
            shards = new Map(shardsArr);
            resolve(shards);
          }
        });
      });
    }
    getShardsFromClusters(0).then(() => {
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
            )}${s.id === currentShard ? `>${s.id}` : s.id}|${client.guilds.filter((g) => g.shard.id === s.id).length
            }${" ".repeat(
              7 -
              client.guilds.filter((g) => g.shard.id === s.id).length.toString()
                .length
            )}|${client.guilds
              .filter((g) => g.shard.id === s.id)
              .map((g) => g.memberCount).reduce((a, b) => a + b, 0)
            }${" ".repeat(
              7 -
              client.guilds
                .filter((g) => g.shard.id === s.id)
                .map((g) => g.memberCount).reduce((a, b) => a + b, 0)
                .toString().length
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
            }|${s.latency !== Infinity ? `${s.latency}ms` : "N/A"}${" ".repeat(
              `${s.latency}ms`.length > 9
                ? 9 - "N/A".length
                : 9 - `${s.latency}ms`.length
            )}`
        )
        .forEach((e) => {
          if ((output[curInd] + e).length >= 2000) {
            output[++curInd] = e;
          } else {
            output[curInd] += "\n" + e;
          }
        });
      let totals = `TOTAL|${client.guilds.size}${" ".repeat(
        7 - client.guilds.size.toString().length
      )}|${client.users.size}${" ".repeat(
        7 - client.users.size.toString().length
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
              .map((s) => s.latency)
              .filter((a) => a !== Infinity)
              .reduce((a, b) => a + b, 0)) /
          shards.map((e) => e.latency).filter((a) => a !== Infinity)
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
};
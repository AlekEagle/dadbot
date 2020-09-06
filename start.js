require("dotenv").config();
const fetch = require("node-fetch");
const pm2 = require("pm2");

setTimeout(() => {
  pm2.connect(() => {
    pm2.describe("dad", (err, proc) => {
      process.env.INSTANCES = proc.length;
      if (!process.env.DEBUG) {
        fetch("https://discord.com/api/v6/gateway/bot", {
          method: "GET",
          headers: {
            Authorization: "Bot " + process.env.token,
          },
        })
          .then((response) => response.json())
          .then((json) => {
            console.debug(json);
            process.env.totalShards = json.shards;
            process.env.firstShardId =
              Math.floor(process.env.totalShards / process.env.INSTANCES) *
              process.env.NODE_APP_INSTANCE;

            process.env.lastShardId =
              process.env.NODE_APP_INSTANCE == process.env.INSTANCES - 1
                ? process.env.totalShards - 1
                : Math.abs(
                    Number(process.env.firstShardId) +
                      Math.floor(
                        process.env.totalShards / process.env.INSTANCES
                      )
                  ) - 1;
            console.log(process.env.firstShardId, process.env.lastShardId);
            require("./bot.js");
          });
      } else {
        process.env.totalShards = process.env.INSTANCES;
        process.env.firstShardId =
          Math.floor(process.env.totalShards / process.env.INSTANCES) *
          process.env.NODE_APP_INSTANCE;

        process.env.lastShardId =
          process.env.NODE_APP_INSTANCE == process.env.INSTANCES - 1
            ? process.env.totalShards - 1
            : Math.abs(
                Number(process.env.firstShardId) +
                  Math.floor(
                    process.env.totalShards / process.env.INSTANCES
                  )
              ) - 1;

        console.log(process.env.firstShardId, process.env.lastShardId);
        require("./bot.js");
      }
    });
  });
}, 5000 * process.env.NODE_APP_INSTANCE);

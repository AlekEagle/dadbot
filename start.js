require("dotenv").config();
const fetch = require("node-fetch");
const pm2 = require("pm2");

setTimeout(() => {
  pm2.connect(() => {
    pm2.describe("dad", (err, proc) => {
      process.env.INSTANCES = proc[0].pm2_env.instances;
      if (!process.env.DEBUG) {
        fetch("https://discord.com/api/v6/gateway/bot", {
          method: "GET",
          headers: {
            Authorization: "Bot " + process.env.token,
          },
        })
          .then((response) => response.json())
          .then((json) => {
            console.log(json);
            process.env.totalShards = json.shards;
            console.log(proc)
            process.env.firstShardId =
              Math.floor(process.env.totalShards / proc[0].pm2_env.instances) *
              process.env.NODE_APP_INSTANCE;

            process.env.lastShardId =
              process.env.NODE_APP_INSTANCE == proc[0].pm2_env.instances - 1
                ? process.env.totalShards - 1
                : Math.abs(
                    Number(process.env.firstShardId) +
                      Math.floor(
                        process.env.totalShards / proc[0].pm2_env.instances
                      )
                  ) - 1;
            console.log(process.env.firstShardId, process.env.lastShardId);
            require("./bot.js");
          });
      } else {
        process.env.totalShards = proc[0].pm2_env.instances;
        process.env.firstShardId =
          Math.floor(process.env.totalShards / proc[0].pm2_env.instances) *
          process.env.NODE_APP_INSTANCE;

        process.env.lastShardId =
          process.env.NODE_APP_INSTANCE == proc[0].pm2_env.instances - 1
            ? process.env.totalShards - 1
            : Math.abs(
                Number(process.env.firstShardId) +
                  Math.floor(
                    process.env.totalShards / proc[0].pm2_env.instances
                  )
              ) - 1;

        console.log(process.env.firstShardId, process.env.lastShardId);
        require("./bot.js");
      }
    });
  });
}, 5000 * process.env.NODE_APP_INSTANCE);

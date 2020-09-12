// Old code LOOOOOL
const CommandClient = require("eris-command-handler");
const env = process.env;
const fs = require("fs");
const request = require("request");
const GrafanaAPIClient = require('grafana-api-client');
const Sequelize = require("sequelize");
const { cpuUsage } = require('os-utils');
const ms = require("ms");
const memory = require('./functions/memoryUsage');
require('./functions/logger')('LOG');
global._database = new Sequelize(
  `postgres://alek:${process.env.serverPass}@127.0.0.1:5432/alekeagle`,
  {
    logging: false,
  }
);
let globalBlacklist = require("./functions/globalBlacklist");
let stats = require("./functions/commandStatistics");
let owners = require("./functions/getOwners");
let prefixes = require("./functions/managePrefixes");
const Sentry = require("@sentry/node");

if (process.env.DEBUG) {
  console.log("DEBUG MODE", process.env.DEBUG);
  console.logLevel = 'DEBUG';
}

Sentry.init({
  dsn: "https://81fb39c6a5904886ba26a90e2a6ea8aa@sentry.io/1407724",
});
owners.initializeOwners().then(
  (list) => {
    console.log(
      `Loaded owners. There are currently ${list.users.length} owners.`
    );
  },
  (err) => {
    console.error(err);
  }
);

global.grafana = new GrafanaAPIClient.Client(process.env.grafanaToken, process.env.NODE_APP_INSTANCE, process.env.INSTANCES, 'ws://localhost:8080/connect');

const client = new CommandClient(
  env.DEBUG ? process.env.otherToken : process.env.token,
  {
    firstShardID: Number(process.env.firstShardId),
    lastShardID: Number(process.env.lastShardId),
    maxShards: Number(process.env.totalShards),
    getAllUsers: true,
    messageLimit: 0,
    defaultImageFormat: "png",
    defaultImageSize: 2048,
  },
  {
    description: "complain and compliment aren't meant to be super serious.",
    owner: "AlekEagle#0001",
    prefix: env.DEBUG ? "test!" : "d!",
  }
);

client.editStatus("dnd", {
  type: 3,
  name: `myself start up!`,
});

client.on("shardReady", (id) => updateShardCount(id));

function updateShardCount(snum) {
  var avail = Number(process.env.totalShards);
  console.log(
    `Shard Status: ${Math.round(((snum + 1 || 0) / avail) * 100) || 0}% [${
    snum + 1 || 0
    }/${avail}]`
  );
}

setTimeout(() => {
  if (client.shards.length === 0) {
    console.log(
      "Discord gave 0 shards available for 15 consecutive seconds. Likely timeout of API or Token is invalid."
    );
  }
}, ms("15sec"));

client.on("ready", () => {
  console.log("Connected.");
  client.editStatus("online", {
    type: 0,
    name: `how do I use this computer thingy?`,
  });
  if (!env.DEBUG) {
    request.post(
      `https://maker.ifttt.com/trigger/bot_connected/with/key/${process.env.iftttToken}`,
      {
        json: {
          value1: "Dad Bot",
        },
      },
      () => {
        console.log(`Told IFTTT that shard (re)connected`);
      }
    );
  }
  client.users.set("1", {
    id: "1",
    createdAt: "2015-05-15T04:00:00.000Z",
    mention: "<@1>",
    bot: true,
    username: "Clyde",
    discriminator: "0001",
    avatar: "f78426a064bc9dd24847519259bc42af",
    system: true,
  });
  loadCmds();
  loadEvts();
});
prefixes
  .managePrefixes({
    action: "refresh",
    client,
  })
  .then((prefixes) => {
    console.log(`Loaded ${prefixes.length} guild prefix(es).`);
  });
prefixes.on("newPrefix", (id, prefix) =>
  client.registerGuildPrefix(id, prefix)
);
prefixes.on("removePrefix", (id) => {
  delete client.guildPrefixes[id];
});
prefixes.on("updatePrefix", (id, prefix) => {
  client.guildPrefixes[id] = prefix;
});
global.loadEvts = (reload) => {
  if (reload) {
    client.eventNames().forEach((e) => {
      if (e !== "ready") {
        var eventlisteners = client.rawListeners(e);
        if (
          e === "messageReactionAdd" ||
          e === "messageReactionRemove" ||
          e === "messageCreate"
        ) {
          eventlisteners = eventlisteners.slice(1);
        }
        eventlisteners.forEach((ev) => {
          client.removeListener(e, ev);
        });
      }
    });
  }
  var events = fs.readdirSync("./events");
  console.log(`Loading ${events.length} events, please wait...`);
  events.forEach((e) => {
    if (reload) delete require.cache[require.resolve(`./events/${e}`)];
    var eventFile = require(`./events/${e}`);
    client.on(eventFile.name, (...args) => {
      eventFile.exec(client, ...args);
    });
  });
};

global.loadCmds = (reload) => {
  if (reload) {
    Object.values(client.commands)
      .map((c) => c.label)
      .filter((c) => c !== "help")
      .forEach((c) => {
        client.unregisterCommand(c);
      });
  }
  var commands = fs.readdirSync("./cmds");
  console.log(`Loading ${commands.length} commands, please wait...`);
  commands.forEach((c) => {
    if (reload) delete require.cache[require.resolve(`./cmds/${c}`)];
    var cmdFile = require(`./cmds/${c}`);
    stats.initializeCommand(cmdFile.name);
    client.registerCommand(
      cmdFile.name,
      (msg, args) => {
        stats.updateUses(cmdFile.name);
        globalBlacklist.getValueByID(msg.channel.id).then((stat) => {
          if (
            stat === null
              ? false
              : stat.cmds.includes("all") || stat.cmds.includes(cmdFile.name)
          ) {
            msg.channel.createMessage(
              "This channel has been blacklisted from Dad Bot!, if you think this is a mistake, please go here https://alekeagle.com/discord and ask AlekEagle#0001 about this issue.\nThis channel may no longer use these commands: `" +
              stat.cmds.join(", ") +
              "`"
            );
            return;
          } else {
            globalBlacklist.getValueByID(msg.author.id).then((stat) => {
              if (
                stat === null
                  ? false
                  : stat.cmds.includes("all") ||
                  stat.cmds.includes(cmdFile.name)
              ) {
                msg.author.getDMChannel().then((chn) => {
                  chn
                    .createMessage(
                      "You have been blacklisted from Dad Bot! If you think this is a mistake, please go here https://alekeagle.com/discord and ask AlekEagle#0001 about this issue.\nYou may no longer use these commands: `" +
                      stat.cmds.join(", ") +
                      "`"
                    )
                    .catch(() => {
                      msg.channel.createMessage(
                        `<@${
                        msg.author.id
                        }> You have been blacklisted from Dad Bot! If you think this is a mistake, please go here https://alekeagle.com/discord and ask AlekEagle#0001 about this issue.\nYou may no longer use these commands: \`${stat.cmds.join(
                          ", "
                        )}\``
                      );
                    });
                });
              } else {
                if (msg.channel.guild) {
                  globalBlacklist
                    .getValueByID(msg.channel.guild.id)
                    .then((stat) => {
                      if (
                        stat === null
                          ? false
                          : stat.cmds.includes("all") ||
                          stat.cmds.includes(cmdFile.name)
                      ) {
                        msg.channel.createMessage(
                          "This server has been blacklisted from Dad Bot!, if you think this is a mistake, please go here https://alekeagle.com/discord and ask AlekEagle#0001 about this issue.\nThis server may no longer use these commands: `" +
                          stat.cmds.join(", ") +
                          "`"
                        );
                        return;
                      } else {
                        try {
                          cmdFile.exec(client, msg, args);
                        } catch (err) {
                          msg.channel.createMessage(
                            "An unexpected error has occured in the processing of this command, if the problem persists please contact Dad Bot's Support Team: https://alekeagle.com/d"
                          );
                          throw err;
                        }
                      }
                    });
                } else {
                  try {
                    cmdFile.exec(client, msg, args);
                  } catch (err) {
                    msg.channel.createMessage(
                      "An unexpected error has occured in the processing of this command, if the problem persists please contact Dad Bot's Support Team: https://alekeagle.com/d"
                    );
                    throw err;
                  }
                }
              }
            });
          }
        });
      },
      cmdFile.options
    );
  });
};

client.connect();

grafana.on('allReady', () => {
  setInterval(() => {
    cpuUsage(percent => {
      grafana.sendStats(client.guilds.size, Math.round(percent * 100), Math.round(new memory.MB().raw()), Math.round(
        (client.shards
          .map((s) => s.latency)
          .filter((a) => a !== Infinity)
          .reduce((a, b) => a + b, 0)) /
        client.shards.map((e) => e.latency).filter((a) => a !== Infinity)
          .length
      ));
    });
  }, 1000);
});

process.on('uncaughtException', function (exception) {
  console.error(exception); 
});

grafana.connect();

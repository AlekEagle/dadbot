'use strict';


require("dotenv").config();
const fetch = require("node-fetch"),
  CommandClient = require('eris-command-handler'),
  Sequelize = require('sequelize');

global._database = new Sequelize(`postgres://alek:${process.env.serverPass}@localhost:5432/alekeagle`, {
  logging: false
});

const { cpuUsage } = require('os-utils'),
  ms = require('ms'),
  GrafanaAPIClient = require('grafana-api-client'),
  memory = require('./functions/memoryUsage'),
  globalBlacklist = require('./functions/globalBlacklist'),
  stats = require('./functions/commandStatistics'),
  prefixes = require('./functions/managePrefixes'),
  Sentry = require('@sentry/node'),
  fs = require('fs');

let client;

require('./functions/logger')('LOG');

global.grafana = new GrafanaAPIClient.Client(process.env.grafanaToken, Number(process.env.NODE_APP_INSTANCE), Number(process.env.instances), 'ws://localhost:8080/connect');

if (!process.env.NODE_APP_INSTANCE || !process.env.instances) {
  throw new Error("Not started via pm2!");
}

grafana.on('error', err => console.error(err));

process.on('SIGINT', () => {
  client.disconnect();
  grafana.disconnect();
  process.exit();
})


setTimeout(() => {
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
          Math.floor(process.env.totalShards / Number(process.env.instances)) *
          process.env.NODE_APP_INSTANCE;

        process.env.lastShardId =
          process.env.NODE_APP_INSTANCE == Number(process.env.instances) - 1
            ? process.env.totalShards - 1
            : Math.abs(
              Number(process.env.firstShardId) +
              Math.floor(
                process.env.totalShards / Number(process.env.instances)
              )
            ) - 1;
        console.debug(process.env.firstShardId, process.env.lastShardId);
        console.debug('Initialized, calling startup sequence...');
        startupSequence();
      });
  } else {
    process.env.totalShards = Number(process.env.instances);
    process.env.firstShardId =
      Math.floor(process.env.totalShards / Number(process.env.instances)) *
      process.env.NODE_APP_INSTANCE;

    process.env.lastShardId =
      process.env.NODE_APP_INSTANCE == Number(process.env.instances) - 1
        ? process.env.totalShards - 1
        : Math.abs(
          Number(process.env.firstShardId) +
          Math.floor(
            process.env.totalShards / Number(process.env.instances)
          )
        ) - 1;
    console.debug(process.env.firstShardId, process.env.lastShardId);
    console.debug('Initialized, calling startup sequence...');
    startupSequence();
  }
}, 5000 * process.env.NODE_APP_INSTANCE);

function clusterStatusUpdate(connected) {
  if (connected) {
    grafana.off('clusterStatusUpdate', clusterStatusUpdate);
    setInterval(() => {
      cpuUsage(percent => {
        grafana.sendStats(client.guilds ? client.guilds.size : 0, Math.round(percent * 100), Math.round(new memory.MB().raw()), Math.round(
          (client.shards
            .map((s) => s.latency)
            .filter((a) => a !== Infinity)
            .reduce((a, b) => a + b, 0)) /
          client.shards.map((e) => e.latency).filter((a) => a !== Infinity)
            .length
        )).catch(() => {});
      });
    }, 10000);
  }
}

grafana.on('clusterStatusUpdate', clusterStatusUpdate);

Sentry.init({
  dsn: "https://81fb39c6a5904886ba26a90e2a6ea8aa@sentry.io/1407724",
});

grafana.on('remoteEval', (data, callback) => {
  let evaluation;
  try {
      evaluation = eval(data);
  } catch (err) {
      callback(err);
      return;
  }
  callback(null, typeof evaluation !== 'string' ? require('util').inspect(evaluation) : evaluation);
});

if (process.env.DEBUG) {
  console.logLevel = 'DEBUG';
  console.debug("DEBUG MODE");
}

function startupSequence() {
  console.log(`Cluster: ${Number(process.env.NODE_APP_INSTANCE) + 1}   Clusters: ${Number(process.env.instances)}   Shards:  ${(Number(process.env.lastShardId) - (Number(process.env.firstShardId) - 1))}`)
  client = new CommandClient(
    process.env.DEBUG ? process.env.otherToken : process.env.token,
    {
      firstShardID: Number(process.env.firstShardId),
      lastShardID: Number(process.env.lastShardId),
      maxShards: Number(process.env.totalShards),
      getAllUsers: false,
      messageLimit: 0,
      defaultImageFormat: "png",
      defaultImageSize: 2048,
    },
    {
      description: "Dad Bot v3??????",
      owner: "AlekEagle#0001 and eli#1000",
      prefix: process.env.DEBUG ? "test!" : "d!",
    }
  );

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

  client.on("shardReady", (id) => updateShardCount(id, client));

  client.editStatus("dnd", {
    type: 3,
    name: `myself start up!`,
  });

  setTimeout(() => {
    if (client.shards.length === 0) {
      console.error(
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
    if (!process.env.DEBUG) {
      fetch(
        `https://maker.ifttt.com/trigger/bot_connected/with/key/${process.env.iftttToken}`,
        {
          method: "POST",
          body: {
            value1: "Dad Bot",
          },
        }
      ).then(() => {
        console.log(`Told IFTTT that shard (re)connected`);
      });
    }
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
    loadCmds();
    loadEvts();
  });

  client.connect();
  grafana.connect();
}

function updateShardCount(snum, client) {
  var avail = (client.options.lastShardID - (client.options.firstShardID - 1));
  console.log(
    `Shard Status: ${Math.round((((snum - client.options.firstShardID) + 1 || 0) / avail) * 100) || 0}% [${
    (snum - client.options.firstShardID) + 1 || 0
    }/${avail}]`
  );
}

process.on('uncaughtException', function (exception) {
  console.error(exception);
});

import Logger, { Level } from './utils/Logger';
import { Constants, Client } from 'oceanic.js';
import envConfig from './utils/dotenv';
import { readFile } from 'node:fs/promises';
import { checkBlacklistStatus } from './utils/Blacklist';
import DadbotClusterClient from '../../dadbot-cluster-client';
import evaluateSafe from './utils/SafeEval';
import EventEmitter from 'node:events';
import { inspect } from 'node:util';
import { incrementCommand, initializeCommand } from './utils/Statistics';
import Memory from './utils/Memory';
import CPU from './utils/CPU';
import verifyChairIntegrity from './utils/VerifyChairIntegrity';
import { getShardAllocation, ShardAllocation } from './utils/ShardAllocator';
import chalk from 'chalk';
import { coolDadBotASCII } from './utils/UselessStartupMessage';
import ReadableTime from './utils/ReadableTime';
import { CommandHandler } from 'oceanic.js-interactions';
import * as Patreon from './utils/Patreon';
import Commands from './commands';
import AutoResponseEvent from './events/AutoResponse';
import AdminCommandHandler from './events/AdminCommands';

envConfig();

export let evaluation = [
  process.env.DISCORD_ID_BOT_EVAL,
  '1370693789244723291',
];

export const isDebug = process.env.DEBUG === 'true';
export const token = !isDebug ? process.env.TOKEN : process.env.OTHER_TOKEN;

export const logger = new Logger(isDebug ? Level.DEBUG : Level.INFO);
export let cluster: DadbotClusterClient<
  'ws',
  { url: 'ws://localhost:8080/manager' }
>;

export let shards: ShardAllocation;

export let handler: CommandHandler;

export let sendShardInfoInterval: NodeJS.Timeout | null;

function clearSendShardInfoInterval() {
  if (sendShardInfoInterval) {
    clearInterval(sendShardInfoInterval);
    sendShardInfoInterval = null;
  }
}

export let client: Client;

export function thankPatreonSupporter() {
  // Fetch the latest patron supporter to thank
  const patron = Patreon.getLatestSupporter();
  client.editStatus('online', [
    {
      name: `Thank you ${patron.full_name} for supporting on Patreon!`,
      type: Constants.ActivityTypes.GAME,
    },
  ]);
}

if (!process.env.CLUSTERS || !process.env.CLUSTER_ID) {
  throw new Error('Missing required environment variables');
}

(async function () {
  // Make sure the chair is intact.
  await verifyChairIntegrity();
  // If we are in debug mode, don't bother with the sentry integration.
  if (!process.env.DEBUG) await import('./utils/Sentry');

  // Initialize the cluster client.
  cluster = new DadbotClusterClient(
    { name: 'ws', options: { url: 'ws://localhost:8080/manager' } },
    process.env.CLUSTER_MANAGER_TOKEN,
    JSON.parse(await readFile('./data/schema.json', 'utf-8')),
    {
      cluster: {
        count: Number(process.env.CLUSTERS),
        id: Number(process.env.CLUSTER_ID),
      },
    },
  );

  cluster.on('connected', () => {
    console.log(chalk.green(' Connected to cluster manager.'));
  });

  cluster.on('disconnected', (err) => {
    console.log(chalk.red(' Disconnected from cluster manager.'));
    console.log(chalk.red(err));
    clearSendShardInfoInterval();
  });

  cluster.on('cluster_status', (count, connected) => {
    if (count !== connected.length) {
      clearSendShardInfoInterval();
      return;
    }
    if (sendShardInfoInterval) return;
    sendShardInfoInterval = setInterval(async () => {
      let cpu = await CPU();
      let ping = Math.round(
        client.shards
          .map((s) => s.latency)
          .filter((a) => isFinite(a))
          .reduce((a, b) => a + b, 0) /
          client.shards.map((e) => e.latency).filter((a) => isFinite(a)).length,
      );
      cluster.sendData(0, {
        ping: isNaN(ping) || !isFinite(ping) ? 0 : ping,
        guilds: client.guilds.size,
        cpuUsage: cpu,
        memoryUsage: Math.round(new Memory().raw() / 1024 / 1024),
      });
    }, 20e3);
  });

  // Set up the shard allocation.
  shards = await getShardAllocation({
    token,
    clusterID: Number(process.env.CLUSTER_ID),
    clusters: Number(process.env.CLUSTERS),
  });

  // Do cool startup message.
  console.log(chalk.green(coolDadBotASCII));
  if (isDebug)
    console.log(chalk.green('                           DEBUG  MODE'));

  // Log some additional information.
  console.log(
    chalk.green(
      ` Cluster ${Number(process.env.CLUSTER_ID) + 1} of ${
        process.env.CLUSTERS
      }`,
    ),
  );
  console.log(
    chalk.green(
      ` Discord recommends ${shards.recommended} shard${
        shards.recommended === 1 ? '' : 's'
      } overall.`,
    ),
  );
  if (shards.total !== shards.recommended)
    console.log(
      chalk.yellow(
        ` We will not be using the recommended number of shards, instead using ${
          shards.total
        } shard${shards.total === 1 ? '' : 's'} overall.`,
      ),
    );
  console.log(
    chalk.green(
      ` This cluster will handle the shards between ${shards.thisCluster.start} and ${shards.thisCluster.end}, or ${shards.thisCluster.count} shards in total.`,
    ),
  );
  console.log(
    chalk.green(
      ` Dad Bot has ${shards.remainingSessions} of ${shards.totalSessions} remaining sessions.`,
    ),
  );
  console.log(
    chalk.green(
      ` The session counter will reset in ${new ReadableTime(
        shards.resetsIn,
      ).toShorthand()}.`,
    ),
  );

  if (shards.remainingSessions <= shards.total) {
    console.error(chalk.red(' Not enough sessions remaining!'));
    process.exit(1);
  }

  // Initialize the client.
  client = new Client({
    auth: `Bot ${token}`,
    allowedMentions: {
      everyone: false,
      roles: false,
      users: false,
      repliedUser: true,
    },
    collectionLimits: {
      messages: 0,
      auditLogEntries: 0,
      integrations: 0,
      scheduledEvents: 0,
      guildThreads: 0,
      stageInstances: 0,
      autoModerationRules: 0,
      voiceMembers: 0,
      groupChannels: 0,
      privateChannels: 0,
      voiceStates: 0,
      channels: 0,
      roles: 0,
      // Obligatory limits to try and cut back on memory leaks/memory exhaustion problems
      // Limit the number of cached members per guild to 500, in theory this shouldn't have an impact on Dad's functionality, but we aren't in physics class
      members: 500,
      // Worst case, limit users and/or guilds. Hopefully it doesn't reach that point
      /*
      // If we limit users, we'll need another way to roughly determine user count.
      users: 10000,
      // If we limit guilds, we are going to have one hell of a time making sure nothing breaks
      guilds: 100,
      */
    },
    defaultImageFormat: 'png',
    defaultImageSize: 2048,
    gateway: {
      firstShardID: shards.thisCluster.start,
      lastShardID: shards.thisCluster.end,
      maxShards: shards.total,
      // compress: true,
      presence: {
        status: 'dnd',
        activities: [
          {
            name: 'myself start up!',
            type: Constants.ActivityTypes.WATCHING,
          },
        ],
        afk: true,
      },
      intents: [
        Constants.Intents.GUILDS,
        Constants.Intents.GUILD_WEBHOOKS,
        Constants.Intents.GUILD_MESSAGES,
        Constants.Intents.GUILD_MESSAGE_TYPING,
        Constants.Intents.GUILD_MESSAGE_REACTIONS,
        Constants.Intents.DIRECT_MESSAGES,
        Constants.Intents.DIRECT_MESSAGE_TYPING,
        Constants.Intents.DIRECT_MESSAGE_REACTIONS,
        Constants.Intents.MESSAGE_CONTENT,
      ],
      connectionProperties: {
        browser: 'Discord Android',
        device: 'Samsung Galaxy Z Flip5',
        os: 'Android',
      },
    },
  });

  // Create an event listener that will log the status of each shard as it connects.
  // This event listener will be removed when the ready event is emitted.
  function logShardStatus(shard: number) {
    console.log(
      chalk.green(` Shard ${shard} of ${shards.thisCluster.count} is ready.`),
    );
  }

  client.on('shardReady', logShardStatus);

  handler = new CommandHandler(client);

  /*
  // Handle errors
  handler.on("error", (error) => {
    interaction.createMessage({
      content: "Whoops! I made a mistake and I'm not sure how to handle it! Try the command again and see if it works this time. If it continues to not work, please let us know in https://alekeagle.com/d",
      flags: Constants.MessageFlags.EPHEMERAL,
    });
    logger.error(error);
  });
  */

  // Handle unregistered message components.
  handler.on('unhandledMessageComponent', (interaction) => {
    interaction.createMessage({
      content:
        "I'm sorry, but I don't remember what that was supposed to do. Try running the command that gave you the item you interacted with again and see if it works. If it continues to not work, please let us know in https://alekeagle.com/d",
      flags: Constants.MessageFlags.EPHEMERAL,
    });
  });

  // Connect to the cluster manager.
  cluster.connect();

  // Initialize the Cross Cluster Communication handler.
  cluster.on('CCCQuery', (data, callback) => {
    logger.debug('Received CCCQuery');
    // Use evaluateSafe to "safely" evaluate whatever is requested from the cluster manager.
    let emitter = evaluateSafe(data, {
      require,
      exports,
      console,
      process,
      client,
      logger,
      cluster,
      shards,
      handler,
    });

    // If emitter is an event emitter, then we can use it as an event emitter.
    if (emitter instanceof EventEmitter) {
      emitter.once('complete', async (out, err) => {
        if (err) {
          console.error(err, out);
          callback(typeof err !== 'string' ? inspect(err) : err);
        } else callback(typeof out !== 'string' ? inspect(out) : out);
      });
      emitter.once('timeoutError', (error) => {
        callback(inspect(error));
      });
    } else {
      // If emitter is not an event emitter, then we just return the result.
      callback(inspect(emitter));
    }
  });

  // Create an event listener for the client ready event
  client.once('ready', async () => {
    console.log(chalk.green(' All shards connected!'));
    client.off('shardReady', logShardStatus);

    // Publish the commands
    console.log(' Publishing commands...');

    await handler.publishCommands();

    console.log(' All commands registered and published!');

    // Begin Patreon periodic fetch
    console.log(' Fetching Patreon supporters...');
    await Patreon.startCacheRefresh();
    console.log(' All Patreon supporters fetched!');

    // Thank the latest Patreon supporter
    thankPatreonSupporter();
  });

  // Set up the error event module
  client.on('error', (error) => {
    logger.error(error);
  });

  console.log(' Registering slash commands...');
  // Register the command modules
  for (const command of Commands) {
    console.log(` Adding command ${command.name}...`);
    handler.registerCommand(command);
  }

  client.on('messageCreate', async (msg) => {
    if (evaluation.includes(msg.channelID)) {
      return AdminCommandHandler(msg);
    } else {
      return AutoResponseEvent(msg);
    }
  });

  // ========================================================
  // TODO: Migrate Dad Bot to the new command handler (this includes the command modules and the event modules)
  // ========================================================

  /* // Set up event modules for the client
  Events.forEach((event) => {
    // Create the event listener on the client
    client.on(event.name, (...args) => {
      // Execute the event listener
      event.handler(...args);
    });
  });

  // Set up the command modules for the client
  Commands.forEach((command) => {
    initializeCommand(command.name);
    client.registerCommand(
      command.name,
      async (msg, args) => {
        incrementCommand(command.name);
        try {
          let blacklistStatus = await checkBlacklistStatus(msg);
          if (
            blacklistStatus === null ||
            (!blacklistStatus.commands.includes(command.name) &&
              !blacklistStatus.commands.includes("all"))
          ) {
            if (typeof command.handler !== "function")
              return command.handler as MessageContent;
            else return (await command.handler(msg, args)) as any;
          } else {
            switch (blacklistStatus.type) {
              case 0:
                let dmChannel;
                try {
                  dmChannel = await msg.author.getDMChannel();
                  dmChannel.createMessage(
                    `Well that's embarrassing, it seems you've been blacklisted from the bot and these commands/features: \`${blacklistStatus.commands.join(
                      ", "
                    )}\`\nIf you'd like to appeal, visit the support server: https://alekeagle.com/d and ask any member who has the "Lil' Crew" role.`
                  );
                } catch (error) {
                  msg.channel.createMessage(
                    `Well that's embarrassing (for ${
                      msg.author.mention
                    } at least), it seems you've been blacklisted from the bot and these commands/features: \`${blacklistStatus.commands.join(
                      ", "
                    )}\`\nIf you'd like to appeal, visit the support server: https://alekeagle.com/d and ask any member who has the "Lil' Crew" role.`
                  );
                }
                break;
              case 1:
                msg.channel.createMessage(
                  `Well that's embarrassing, it seems this channel has been blacklisted from the bot and these commands/features: \`${blacklistStatus.commands.join(
                    ", "
                  )}\`\nIf you'd like to appeal, visit the support server: https://alekeagle.com/d and ask any member who has the "Lil' Crew" role.`
                );
                break;
              case 2:
                msg.channel.createMessage(
                  `Well that's embarrassing, it seems this server has been blacklisted from the bot and these commands/features: \`${blacklistStatus.commands.join(
                    ", "
                  )}\`\nIf you'd like to appeal, visit the support server: https://alekeagle.com/d and ask any member who has the "Lil' Crew" role.`
                );
                break;
            }
          }
        } catch (error) {
          console.error(error);
          msg.channel.createMessage(
            `Well, that's embarrassing, I had an issue while processing the ${command.name} command, hopefully this was just a one time thing and you can try again momentarily. If this isn't a one time thing, please visit the support server: https://alekeagle.com/d and describe exactly what you were doing immediately prior to this happening and we should be able to fix this issue together.`
          );
        }
      },
      command.options
    );
  }); */

  // Finally, tell the client to connect to Discord.
  client.connect();
})();

function deathCroak(thing: string | number) {
  client.disconnect(false);
  cluster.disconnect();
  // Dad screams at the user that he is dying.
  console.error(
    chalk.red(
      'A'.repeat(Math.floor(Math.random() * 1_000_000) + 1) +
        '\ni stubbed my toe :(',
    ),
  );
  if (typeof thing === 'string') {
    // This is a signal eg: SIGINT
    // Nodejs will no longer exit by default with this event handler
    // so we need to manually exit.
    process.exit(0);
  }
}

process.on('exit', deathCroak);

// If the process is killed, disconnect the client.
process.on('SIGINT', deathCroak);
process.on('SIGTERM', deathCroak);
process.on('SIGQUIT', deathCroak);
process.on('SIGHUP', deathCroak);
process.on('SIGBREAK', deathCroak);
process.on('SIGABRT', deathCroak);

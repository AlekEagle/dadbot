import Logger, { Level } from './utils/Logger';
import envConfig from './utils/dotenv';
import Eris, { MessageContent } from 'eris';
import { readFile } from 'node:fs/promises';
import ECH from 'eris-command-handler';
import Events from './events';
import Commands from './commands';
import { checkBlacklistStatus } from './utils/Blacklist';
import DadbotClusterClient from '../../dadbot-cluster-client';
import evaluateSafe from './utils/SafeEval';
import EventEmitter from 'node:events';
import { inspect } from 'node:util';
import { incrementCommand, initializeCommand } from './utils/Statistics';
import { startPrefixManager } from './utils/Prefixes';
import Memory from './utils/Memory';
import CPU from './utils/CPU';
import verifyChairIntegrity from './utils/VerifyChairIntegrity';
import { getShardAllocation, ShardAllocation } from './utils/ShardAllocator';
import chalk from 'chalk';
import { coolDadBotASCII } from './utils/UselessStartupMessage';
import ReadableTime from './utils/ReadableTime';

envConfig();

export const isDebug = process.env.DEBUG === 'true';
export const token = !isDebug ? process.env.TOKEN : process.env.OTHER_TOKEN;

export const logger = new Logger(isDebug ? Level.DEBUG : Level.INFO);
export let cluster: DadbotClusterClient<
  'ws',
  { url: 'ws://localhost:8080/manager' }
>;

export let shards: ShardAllocation;

export let sendShardInfoInterval: NodeJS.Timer | null;

function clearSendShardInfoInterval() {
  if (sendShardInfoInterval) {
    clearInterval(sendShardInfoInterval);
    sendShardInfoInterval = null;
  }
}

export let client: ECH.CommandClient;

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
        id: Number(process.env.CLUSTER_ID)
      }
    }
  );

  cluster.on('connected', () => {
    console.log(chalk.green(' Connected to cluster manager.'));
  });

  cluster.on('disconnected', err => {
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
          .map(s => s.latency)
          .filter(a => isFinite(a))
          .reduce((a, b) => a + b, 0) /
          client.shards.map(e => e.latency).filter(a => isFinite(a)).length
      );
      cluster.sendData(0, {
        ping: isNaN(ping) || !isFinite(ping) ? 0 : ping,
        guilds: client.guilds.size,
        cpuUsage: cpu,
        memoryUsage: Math.round(new Memory().raw() / 1024 / 1024)
      });
    }, 5000);
  });

  // Set up the shard allocation.
  shards = await getShardAllocation({
    token,
    clusterID: Number(process.env.CLUSTER_ID),
    clusters: Number(process.env.CLUSTERS)
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
      }`
    )
  );
  console.log(
    chalk.green(
      ` Discord recommends ${shards.total} shard${
        shards.total === 1 ? '' : 's'
      } overall.`
    )
  );
  console.log(
    chalk.green(
      ` This cluster will handle the shards between ${shards.thisCluster.start} and ${shards.thisCluster.end}, or ${shards.thisCluster.count} shards in total.`
    )
  );
  console.log(
    chalk.green(
      ` Dad Bot has ${shards.remainingSessions} of ${shards.totalSessions} remaining sessions.`
    )
  );
  console.log(
    chalk.green(
      ` The session counter will reset in ${new ReadableTime(
        shards.resetsIn
      ).toShorthand()}.`
    )
  );

  if (shards.remainingSessions <= shards.total) {
    console.error(chalk.red(' Not enough sessions remaining!'));
    process.exit(1);
  }

  // Initialize the client.
  client = new ECH.CommandClient(
    token,
    {
      getAllUsers: false,
      defaultImageSize: 2048,
      defaultImageFormat: 'png',
      intents: [
        'directMessageReactions',
        'directMessageTyping',
        'directMessages',
        'guilds',
        'guildMessageReactions',
        'guildMessageTyping',
        'guildMessages',
        'guildWebhooks'
      ],
      maxShards: shards.total,
      firstShardID: shards.thisCluster.start,
      lastShardID: shards.thisCluster.end,
      messageLimit: 0,
      restMode: true,
      allowedMentions: {
        everyone: false,
        roles: false,
        users: false
      }
    },
    {
      prefix: isDebug ? 'test!' : 'd!',
      name: 'Dad Bot',
      description: 'The father you always wanted',
      defaultHelpCommand: false,
      owner: 'AlekEagle#0001'
    }
  );

  // Create an event listener that will log the status of each shard as it connects.
  // This event listener will be removed when the ready event is emitted.
  function logShardStatus(shard: number) {
    console.log(
      chalk.green(
        ` Shard ${shard + 1} of ${shards.thisCluster.count} is ready.`
      )
    );
  }

  client.on('shardReady', logShardStatus);

  // Set Dad's status telling everyone he is starting up.
  client.editStatus('dnd', {
    name: 'myself start up!',
    type: Eris.Constants.ActivityTypes.WATCHING
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
      shards
    });

    // If emitter is an event emitter, then we can use it as an event emitter.
    if (emitter instanceof EventEmitter) {
      emitter.once('complete', async (out, err) => {
        if (err) {
          console.error(err, out);
          callback(typeof err !== 'string' ? inspect(err) : err);
        } else callback(typeof out !== 'string' ? inspect(out) : out);
      });
      emitter.once('timeoutError', error => {
        callback(inspect(error));
      });
    } else {
      // If emitter is not an event emitter, then we just return the result.
      callback(inspect(emitter));
    }
  });

  // Create an event listener for the client ready event
  client.once('ready', () => {
    console.log(chalk.green(' All shards connected!'));
    client.off('shardReady', logShardStatus);
    // Thank the newest patron
    client.editStatus('online', {
      name: 'Thank you MissingWerewolf for supporting on Patreon!',
      type: 0
    });
    // Start the prefix manager
    startPrefixManager(client);
  });

  // Set up the error event module
  client.on('error', error => {
    logger.error(error);
  });

  // Set up event modules for the client
  Events.forEach(event => {
    // Create the event listener on the client
    client.on(event.name, (...args) => {
      // Execute the event listener
      event.handler(...args);
    });
  });

  // Set up the command modules for the client
  Commands.forEach(command => {
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
              !blacklistStatus.commands.includes('all'))
          ) {
            if (typeof command.handler !== 'function')
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
                      ', '
                    )}\`\nIf you'd like to appeal, visit the support server: https://alekeagle.com/d and ask any member who has the "Lil' Crew" role.`
                  );
                } catch (error) {
                  msg.channel.createMessage(
                    `Well that's embarrassing (for ${
                      msg.author.mention
                    } at least), it seems you've been blacklisted from the bot and these commands/features: \`${blacklistStatus.commands.join(
                      ', '
                    )}\`\nIf you'd like to appeal, visit the support server: https://alekeagle.com/d and ask any member who has the "Lil' Crew" role.`
                  );
                }
                break;
              case 1:
                msg.channel.createMessage(
                  `Well that's embarrassing, it seems this channel has been blacklisted from the bot and these commands/features: \`${blacklistStatus.commands.join(
                    ', '
                  )}\`\nIf you'd like to appeal, visit the support server: https://alekeagle.com/d and ask any member who has the "Lil' Crew" role.`
                );
                break;
              case 2:
                msg.channel.createMessage(
                  `Well that's embarrassing, it seems this server has been blacklisted from the bot and these commands/features: \`${blacklistStatus.commands.join(
                    ', '
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
  });

  // Finally, tell the client to connect to Discord.
  client.connect();
})();

function deathCroak(thing: string | number) {
  client.disconnect({ reconnect: false });
  cluster.disconnect();
  // Dad screams at the user that he is dying.
  console.error(chalk.red('A'.repeat(Math.floor(Math.random() * 100000) + 1)));
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

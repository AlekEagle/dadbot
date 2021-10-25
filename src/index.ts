import Logger, { Level } from './utils/Logger';

global.console = new Logger(
  process.env.DEBUG ? Level.DEBUG : Level.WARN
) as any;

import envConfig from './utils/dotenv';
import { Constants, MessageContent } from 'eris';
import FS from 'node:fs';
import ECH from 'eris-command-handler';
import Events from './events';
import Commands from './commands';
import { checkBlacklistStatus } from './utils/Blacklist';
import fetch from 'node-fetch';
import DadbotClusterClient from '../../dadbot-cluster-client';
import evaluateSafe from './utils/SafeEval';
import EventEmitter from 'node:events';
import Utils from 'node:util';

const Cluster = new DadbotClusterClient(
  { name: 'ws', options: { url: 'ws://localhost:8080/manager' } },
  process.env.grafanaToken,
  JSON.parse(FS.readFileSync('./data/schema.json', 'utf-8')),
  {
    cluster: {
      count: parseInt(process.env.instances),
      id: parseInt(process.env.NODE_APP_INSTANCE)
    }
  }
);

Cluster.on('connected', () => {
  console.log('Connected to cluster manager.');
});

(process as any).clusterClient = Cluster;

(async function () {
  if (process.env.DEBUG) return;
  await import('./utils/Sentry');
})();

envConfig();

if (!process.env.instances || !process.env.NODE_APP_INSTANCE) {
  throw new Error('Missing required environment variables');
}

async function calculateShardReservation() {
  let totalShards: number = process.env.shardCountOverride
    ? parseInt(process.env.shardCountOverride)
    : 1;
  if (!process.env.shardCountOverride) {
    let req = await fetch(
      `https://discord.com/api/v${Constants.REST_VERSION}/gateway/bot`,
      {
        headers: {
          Authorization: `Bot ${
            process.env.DEBUG ? process.env.otherToken : process.env.token
          }`
        }
      }
    );
    if (req.status === 429) {
      console.error("I've been ratelimited!");
      throw new Error('Ratelimited');
    } else {
      let json = await req.json();
      totalShards = json.shards;
    }
  }
  return {
    start: Math.floor(
      (totalShards / parseInt(process.env.instances)) *
        parseInt(process.env.NODE_APP_INSTANCE)
    ),
    end:
      parseInt(process.env.NODE_APP_INSTANCE) ===
      parseInt(process.env.instances) - 1
        ? totalShards - 1
        : Math.abs(
            Math.floor(
              (totalShards / parseInt(process.env.instances)) *
                parseInt(process.env.NODE_APP_INSTANCE)
            ) + Math.floor(totalShards / parseInt(process.env.instances))
          ) - 1,
    total: totalShards
  };
}
(async function () {
  let shards = await calculateShardReservation();
  let client = new ECH.CommandClient(
    process.env.DEBUG ? process.env.otherToken : process.env.token,
    {
      getAllUsers: false,
      defaultImageSize: 2048,
      defaultImageFormat: 'png',
      intents: [
        'directMessageReactions',
        'directMessageTyping',
        'directMessages',
        'guildMessages',
        'guildWebhooks',
        'guilds',
        'guildMessageReactions'
      ],
      maxShards: shards.total,
      firstShardID: shards.start,
      lastShardID: shards.end
    },
    {
      prefix: process.env.DEBUG ? 'test!' : 'd!',
      name: 'Dad Bot',
      description: 'Dad Bot v4 (TypeScript Edition)',
      defaultHelpCommand: false,
      owner: 'AlekEagle#0001'
    }
  );
  Cluster.connect();
  Cluster.on('CCCQuery', (data, cb) => {
    console.debug('Received CCCQuery');
    let emitter = evaluateSafe(data, {
      require,
      exports,
      console,
      client
    });
    if (emitter instanceof EventEmitter) {
      emitter.once('complete', async (out, err) => {
        cb(typeof out !== 'string' && !err ? Utils.inspect(err || out) : out);
      });
      emitter.once('timeoutError', error => {
        cb(Utils.inspect(error));
      });
    } else {
      cb(Utils.inspect(emitter));
    }
  });

  client.on('ready', () => {
    console.log('Ready!');
  });

  Events.forEach(event => {
    client.on(event.name, (...args) => {
      event.handler(client, ...args);
    });
  });

  Commands.forEach(command => {
    console.debug(`Loading command "${command.name}".`);
    client.registerCommand(
      command.name,
      async (msg, args) => {
        try {
          let blacklistStatus = await checkBlacklistStatus(msg);
          if (
            blacklistStatus === null ||
            (!blacklistStatus.commands.includes(command.name) &&
              !blacklistStatus.commands.includes('all'))
          ) {
            if (typeof command.handler !== 'function') {
              return command.handler as MessageContent;
            } else {
              return (await command.handler(client, msg, args)) as any;
            }
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

  client.connect();
})();

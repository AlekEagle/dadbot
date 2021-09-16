import Logger, { Level } from './utils/Logger';

global.console = new Logger(
  process.env.DEBUG ? Level.DEBUG : Level.WARN
) as any;

import envConfig from './utils/dotenv';
import { Constants, MessageContent } from 'eris';
import ECH from 'eris-command-handler';
import Events from './events';
import Commands from './commands';
import { checkBlacklistStatus } from './utils/Blacklist';
import fetch from 'node-fetch';

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
        : Math.floor(
            (totalShards / parseInt(process.env.instances)) *
              parseInt(process.env.NODE_APP_INSTANCE)
          ) +
          totalShards / parseInt(process.env.instances),
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

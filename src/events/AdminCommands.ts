import { Message } from 'oceanic.js';
import { isOwner } from '../utils/Owners';
import evaluateSafe from '../utils/SafeEval';
import Cumulonimbus from 'cumulonimbus-wrapper';
import { inspect } from 'util';

import { client, logger, cluster, shards, handler } from '../index';
import EventEmitter from 'events';

const CODE_MATCH = /^```ts([\w\W]+)```$/;

const cumulonimbus = new Cumulonimbus(process.env.CUMULONIMBUS_TOKEN);

export default async function AdminCommandHandler(message: Message) {
  if (message.author.bot) return;
  if (!(await isOwner(message.author.id, true))) return;

  const match = message.content.match(CODE_MATCH);
  let code =
    match?.[1] ?? (message.content.startsWith('--') ? null : message.content);
  if (code == null) return;
  try {
    const emitter = evaluateSafe(code, {
      require,
      exports,
      console,
      process,
      client,
      logger,
      cluster,
      shards,
      handler,
      msg: message,
    });

    if (emitter instanceof EventEmitter) {
      emitter.once('complete', async (out, err) => {
        if (err) console.error(err, out);
        const result = typeof out === 'string' ? out : inspect(out);
        // If result is too long, we will upload it to Cumulonimbus.
        if (result.length > 4000) {
          try {
            // Pack the result into a File object.
            const file = new File(
              [
                new Blob([result], {
                  type: 'text/plain',
                }),
              ],
              'result.txt',
            );
            const upload = await cumulonimbus.upload(file, 'text/plain');
            await client.rest.channels.createMessage(message.channelID, {
              content: `Result too long. [Cumulonimbus link](${upload.result.url})`,
            });
          } catch (e) {
            if (e instanceof Cumulonimbus.ResponseError) {
              await client.rest.channels.createMessage(message.channelID, {
                content: `Cumulonimbus upload failed: ${e.message}`,
              });
            }
            console.error(e);
          }
        } else {
          await client.rest.channels.createMessage(message.channelID, {
            content: result,
          });
        }
      });
      emitter.once('timeoutError', (error) => {
        client.rest.channels.createMessage(message.channelID, {
          content: inspect(error),
        });
      });
    } else {
      // If emitter is not an event emitter, then we just return the result.
      await client.rest.channels.createMessage(message.channelID, {
        content: inspect(emitter),
      });
    }
  } catch (e) {
    await client.rest.channels.createMessage(message.channelID, {
      content: inspect(e),
    });
    return;
  }
}

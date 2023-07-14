import { Message } from "oceanic.js";
import { isOwner } from "../utils/Owners";
import evaluateSafe from "../utils/SafeEval";
import { inspect } from "util";

import { client, logger, cluster, shards, handler } from "../index";
import EventEmitter from "events";

const CODE_MATCH = /^```ts([\w\W]+)```$/;

export default async function AdminCommandHandler(message: Message) {
  if (message.author.bot) return;
  if (!(await isOwner(message.author.id, true))) return;

  const match = message.content.match(CODE_MATCH);
  let code =
    match?.[1] ?? (message.content.startsWith("--") ? null : message.content);
  if (code == null) return;
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
    emitter.once("complete", async (out, err) => {
      if (err) {
        console.error(err, out);
        client.rest.channels.createMessage(message.channelID, {
          content: typeof err !== "string" ? inspect(err) : err,
        });
      } else
        client.rest.channels.createMessage(message.channelID, {
          content: typeof out !== "string" ? inspect(out) : out,
        });
    });
    emitter.once("timeoutError", (error) => {
      client.rest.channels.createMessage(message.channelID, {
        content: inspect(error),
      });
    });
  } else {
    // If emitter is not an event emitter, then we just return the result.
    client.rest.channels.createMessage(message.channelID, {
      content: inspect(emitter),
    });
  }
}

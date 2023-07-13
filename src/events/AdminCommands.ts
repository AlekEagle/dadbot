import { Message } from "oceanic.js";
import { isOwner } from "../utils/Owners";
import evaluateSafe from "../utils/SafeEval";

const CODE_MATCH = /^```ts([\w\W]+)```$/;

export default async function AdminCommandHandler(message: Message) {
  if (message.author.bot) return;
  if (!isOwner(message.author.id, true)) return;

  const match = message.content.match(CODE_MATCH);
  let code = match[1] ?? message.content.startsWith("--") ? null : message.content;
  if (code == null) return;
  evaluateSafe(code, {message});
}

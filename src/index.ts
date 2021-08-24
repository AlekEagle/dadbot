import envConfig from './utils/dotenv';
import {Client, Message, MessageContent, TextableChannel} from "eris";
import { format } from 'path/posix';
//import './utils/Sentry';

async function typeSend(channel: TextableChannel, content: MessageContent) {
  await wait(randomBoolean(0.6) ? randomRange(300, 500) : randomRange(1000, 3000));

  let text = typeof content == 'string' ? content : content.content;
  let time = text.length / 5.1 / 65 * 60000;
  console.log(time);

  await channel.sendTyping();
  await wait(time);

  await channel.createMessage(content);
}

function randomBoolean(chance: number = 0.5) {
  return Math.random() > chance;
}

function randomRange(from: number, to: number) {
  return Math.random() * (to - from) + from;
}

function wait(time: number) {
  return new Promise(timeup => setTimeout(timeup, time));
}

const IM_MATCH = /(im|i'm|i\s+am)\s+([\w\W]*)/i;
const FORMAT_MATCH = /\*\*\*([\W\w]+)\*\*\*|\*\*([\W\w]+)\*\*|\*([\W\w]+)\*|```([\W\w]+)```|`([\W\w]+)`|_([\W\w]+)_|\|\|([\W\w]+)\|\|/ig;

let client = new Client('ODA5MTEwOTg2MTUzNjU2MzQw.YCQVUw.sTJneA52rZuAg1sWiJd4psgi7NQ');
client.on('messageCreate', onMessageCreate);

async function onMessageCreate(message: Message) {
  if (message.author.bot) return;

  let match = message.content.match(IM_MATCH);
  if (match) {
    let formatting = formats(message.content);
    let spoiler = formatting[1]
      .some(formatting => formatting.type == 7 && formatting.index + 2 >= match.index);
    let fuck = formatting[0].match(IM_MATCH);

    let outgoing = `Hi ${fuck[2]}, I'm Dad!`;
    if (spoiler) outgoing = `||${outgoing}||`;
    typeSend(message.channel, outgoing);
  }
}

type Yes = {type: number, content: string, index: number};

function formats(raw: string): [string, Yes[]] {
  let content = "";
  let formatting: Yes[] = [];
  let last = 0;

  Array.from(raw.matchAll(FORMAT_MATCH))
    .forEach(item => {
      console.log(item);
      let type = item.findIndex((item, index) => item && index != 0);
      content += raw.substring(0, item.index);
      last = item.index + item[0].length;
      formatting.push({
        "type": type,
        "content": item[type],
        "index": item.index + 1
      });

      let [innerContent, innerFormatting] = formats(item[type]);
      content += innerContent;
      formatting = [...formatting, ...innerFormatting];
    });
  content += raw.substr(last);
  return [content, formatting];
}

client.connect();

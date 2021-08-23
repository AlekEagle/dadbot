import envConfig from './utils/dotenv';
import {Client, Message, MessageContent, TextableChannel} from "eris";
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

const IM_MATCH = /(im|i'm|i\s+am)\s+([\w\W]*)/i

let client = new Client('get rekt lol');
client.on('messageCreate', onMessageCreate);

async function onMessageCreate(message: Message) {
  if (message.author.bot) return;

  let match = message.content.match(IM_MATCH);
  if (match) {
    typeSend(message.channel, `Hi ${match[2]}, I'm Dad!`);
  }
}

client.connect();

import Utils from 'node:util';
import fetch from 'node-fetch';
import FormData from 'form-data';
import { isOwner } from '../utils/Owners';
import { CommandModule } from '../types';
import EventEmitter from 'node:events';
import { Message, MessageContent } from 'eris';
import evaluateSafe from '../utils/SafeEval';

async function constructMessage(
  output: any,
  input: string,
  isError: boolean,
  options: string[],
  message: Message
): Promise<MessageContent> {
  let inspectedOutput =
    typeof output === 'string' ? output : Utils.inspect(output);

  if (isError) {
    if (inspectedOutput.length > 1024 || input.length > 4000) {
      let url = await uploadOutput(
        `Input: \n${input}\n\n\nOutput:\n${inspectedOutput}`
      );
      return (
        'The output was too big to fit in a message, here it is in a file instead! ' +
        url
      );
    } else
      return {
        content: '',
        embed: {
          title: 'Error',
          color: 0xff0000,
          author: {
            name: message.author.username,
            icon_url: message.author.dynamicAvatarURL('png', 128)
          },
          description: `Input:\n\`\`\`ts\n${input}\n\`\`\``,
          fields: [
            {
              name: 'Output',
              value: `\`\`\`\n${inspectedOutput}\n\`\`\``
            }
          ]
        }
      };
  } else {
    if (!options || options.length < 1) {
      let rtnStr = `\`\`\`ts\n${inspectedOutput}\n\`\`\``;
      if (rtnStr.length > 2000) {
        let url = await uploadOutput(inspectedOutput);
        return (
          'The output was too big to fit in a message, here it is in a file instead! ' +
          url
        );
      } else return rtnStr;
    } else if (options.length === 1) {
      if (options.includes('r')) {
        if (inspectedOutput.length > 2000) {
          let url = await uploadOutput(inspectedOutput);
          return (
            'The output was too big to fit in a message, here it is in a file instead! ' +
            url
          );
        } else return inspectedOutput;
      } else if (options.includes('i')) {
        let rtnStr = `Input: \`\`\`ts\n${input}\n\`\`\`Output: \`\`\`ts\n${inspectedOutput}\n\`\`\``;
        if (rtnStr.length > 2000) {
          let url = await uploadOutput(
            `Input: \n${input}\n\n\nOutput:\n${inspectedOutput}`
          );
          return (
            'The output was too big to fit in a message, here it is in a file instead! ' +
            url
          );
        } else {
          return rtnStr;
        }
      } else if (options.includes('e')) {
        if (inspectedOutput.length > 4000) {
          let url = await uploadOutput(inspectedOutput);
          return (
            'The output was too big to fit in a message, here it is in a file instead! ' +
            url
          );
        }
        return {
          content: '',
          embed: {
            title: 'Output',
            description: `\`\`\`ts\n${inspectedOutput}\n\`\`\``
          }
        };
      } else if (options.includes('q')) {
        return null;
      } else if (options.includes('u')) {
        let url = await uploadOutput(inspectedOutput);
        return `Uploaded! here's the link: ${url}`;
      } else {
        if (inspectedOutput.length > 1990) {
          let url = await uploadOutput(inspectedOutput);
          return (
            'The output was too big to fit in a message, here it is in a file instead! ' +
            url
          );
        } else return `\`\`\`ts\n${inspectedOutput}\n\`\`\``;
      }
    } else if (options.length === 2) {
      if (options.includes('i') && options.includes('e')) {
        if (input.length > 4000 || inspectedOutput.length > 1200) {
          let url = await uploadOutput(
            `Input: \n${input}\n\n\nOutput:\n${inspectedOutput}`
          );
          return (
            'The output was too big to fit in a message, here it is in a file instead! ' +
            url
          );
        } else
          return {
            content: '',
            embed: {
              title: 'Output',
              description: `Input:\n\`\`\`ts\n${input}\n\`\`\``,
              fields: [
                {
                  name: 'Output',
                  value: `\`\`\`ts\n${inspectedOutput}\n\`\`\``
                }
              ]
            }
          };
      } else if (options.includes('r') && options.includes('e')) {
        if (inspectedOutput.length > 4096) {
          let url = await uploadOutput(inspectedOutput);
          return (
            'The output was too big to fit in a message, here it is in a file instead! ' +
            url
          );
        }
        return {
          content: '',
          embed: {
            title: 'Output',
            description: `${inspectedOutput}`
          }
        };
      } else if (options.includes('i') && options.includes('u')) {
        let url = await uploadOutput(
          `Input: \n${input}\n\n\nOutput:\n${inspectedOutput}`
        );
        return `Uploaded! here's the link: ${url}`;
      }
    }
  }
}

async function uploadOutput(output: string): Promise<string> {
  let data = new FormData();
  data.append('file', Buffer.from(output), 'joe.txt');
  let res = await fetch('https://alekeagle.me/api/upload/', {
    method: 'POST',
    body: data,
    headers: {
      Authorization: process.env.alekeagleMEToken
    }
  });
  return await res.text();
}

const __command: CommandModule = {
  name: 'eval',

  async handler(client, msg, args) {
    if (!(await isOwner(msg.author.id, true))) return 'undefined';
    args.shift();
    let options: string[] = [];
    if (args[0].match(/^-(\w+)$/)) {
      options = args[0].match(/^-(\w+)$/)[1].split('');
      args.shift();
      args.shift();
    }

    let message: Message = null;
    if (!options.includes('q'))
      message = await msg.channel.createMessage(
        'Braining... <a:loading1:470030932775272469>'
      );
    let emitter = evaluateSafe(
      args
        .join('')
        .replace(
          /(?:(?:```(?:ts|js|javascript|typescript)?\n)|(?:\n```))/gi,
          ''
        ),
      {
        client,
        msg,
        args,
        require,
        exports,
        console,
        process
      }
    );
    if (emitter instanceof EventEmitter) {
      emitter.once('complete', async (out, err) => {
        if (!options.includes('q') || err)
          await message.edit(
            await constructMessage(
              out,
              args
                .join('')
                .replace(
                  /(?:(?:```(?:ts|js|javascript|typescript)?\n)|(?:\n```))/gi,
                  ''
                ),
              err,
              options,
              msg
            )
          );
        else msg.addReaction('✅');
      });
      emitter.once('timeoutError', async (error, cb) => {
        const inspectedOut: string =
          typeof error !== 'string' ? Utils.inspect(error) : error;
        msg.channel.createMessage(
          `${msg.author.mention}\nHmm, it seems there was an error inside a ${cb} callback, its been cleared. Here's the error:\n\`\`\`\n${inspectedOut}\n\`\`\`\nI've gone ahead and cleared the ${cb} to prevent further errors.`
        );
      });
    } else {
      message.edit(
        await constructMessage(
          emitter,
          args
            .join('')
            .replace(
              /(?:(?:```(?:ts|js|javascript|typescript)?\n)|(?:\n```))/gi,
              ''
            ),
          true,
          options,
          msg
        )
      );
    }
  },
  options: {
    removeWhitespace: false,
    whitespaceSeparator: /(\s(?<!\n))/g,
    hidden: true
  }
};
export default __command;

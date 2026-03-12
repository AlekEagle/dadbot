import { inspect } from 'node:util';
import { Message, CreateMessageOptions } from 'oceanic.js';
import Cumulonimbus from 'cumulonimbus-wrapper';
import { EventEmitter } from 'node:events';
import { Buffer, File } from 'node:buffer';
import { isOwner } from '../utils/Owners';
import { client, logger, cluster, shards, handler, isDebug } from '..';
import evaluateSafe from '../utils/SafeEval';

const cumulonimbus = new Cumulonimbus(process.env.ALEKEAGLE_ME_TOKEN!);

async function uploadOutput(output: string): Promise<string> {
  try {
    // Construct a file from the output string
    const file = new File([Buffer.from(output)], 'output.txt', {
      type: 'text/plain',
    });
    let res = await cumulonimbus.upload(file, 'text/plain');
    return res.result.url;
  } catch (error) {
    console.error('Error uploading output:', error);
    return 'Error uploading output';
  }
}

enum ValidFlags {
  Raw = 'r',
  Input = 'i',
  Embed = 'e',
  Quiet = 'q',
  Upload = 'u',
}

async function constructMessage(
  output: any,
  input: string,
  isError: boolean,
  flags: ValidFlags[],
): Promise<CreateMessageOptions | null> {
  let inspectedOutput = typeof output === 'string' ? output : inspect(output);

  if (isError) {
    if (inspectedOutput.length > 1024 || input.length > 4000) {
      let url = await uploadOutput(
        `Input: \n${input}\n\n\nOutput:\n${inspectedOutput}`,
      );
      return {
        content:
          'The output was too big to fit in a message, here it is in a file instead! ' +
          url,
      };
    } else
      return {
        content: '',
        embeds: [
          {
            title: 'Error',
            color: 0xff0000,
            author: {
              name: client.user.globalName!,
              iconURL: client.user.avatarURL('gif', 128),
            },
            description: `Input:\n\`\`\`ts\n${input}\n\`\`\``,
            fields: [
              {
                name: 'Output',
                value: `\`\`\`\n${inspectedOutput}\n\`\`\``,
              },
            ],
          },
        ],
      };
  } else {
    // Handle Options
    // No options, just return output in a code block
    if (!flags || flags.length < 1) {
      let rtnStr = `\`\`\`ts\n${inspectedOutput}\n\`\`\``;
      if (rtnStr.length > 2000) {
        let url = await uploadOutput(inspectedOutput);
        return {
          content:
            'The output was too big to fit in a message, here it is in a file instead! ' +
            url,
        };
      } else
        return {
          content: rtnStr,
        };
    } else if (flags.length === 1) {
      // Raw output, no code block
      if (flags.includes(ValidFlags.Raw)) {
        if (inspectedOutput.length > 2000) {
          let url = await uploadOutput(inspectedOutput);
          return {
            content:
              'The output was too big to fit in a message, here it is in a file instead! ' +
              url,
          };
        } else
          return {
            content: inspectedOutput,
          };
        // Input and output, both in code blocks
      } else if (flags.includes(ValidFlags.Input)) {
        let rtnStr = `Input: \`\`\`ts\n${input}\n\`\`\`Output: \`\`\`ts\n${inspectedOutput}\n\`\`\``;
        if (rtnStr.length > 2000) {
          let url = await uploadOutput(
            `Input: \n${input}\n\n\nOutput:\n${inspectedOutput}`,
          );
          return {
            content:
              'The output was too big to fit in a message, here it is in a file instead! ' +
              url,
          };
        } else {
          return {
            content: rtnStr,
          };
        }
        // Embed output, input not shown
      } else if (flags.includes(ValidFlags.Embed)) {
        if (inspectedOutput.length > 4000) {
          let url = await uploadOutput(inspectedOutput);
          return {
            content:
              'The output was too big to fit in a message, here it is in a file instead! ' +
              url,
          };
        }
        return {
          content: '',
          embeds: [
            {
              color: 0x00ff00,
              title: 'Output',
              description: `\`\`\`ts\n${inspectedOutput}\n\`\`\``,
            },
          ],
        };
        // Quiet mode, no output
      } else if (flags.includes(ValidFlags.Quiet)) {
        return null;
        // Upload output to file and return link
      } else if (flags.includes(ValidFlags.Upload)) {
        let url = await uploadOutput(inspectedOutput);
        return { content: `Uploaded! here's the link: ${url}` };
      } else {
        if (inspectedOutput.length > 1990) {
          let url = await uploadOutput(inspectedOutput);
          return {
            content:
              'The output was too big to fit in a message, here it is in a file instead! ' +
              url,
          };
        } else return { content: `\`\`\`ts\n${inspectedOutput}\n\`\`\`` };
      }
    } else if (flags.length === 2) {
      if (
        flags.includes(ValidFlags.Input) &&
        flags.includes(ValidFlags.Embed)
      ) {
        if (input.length > 4000 || inspectedOutput.length > 1200) {
          let url = await uploadOutput(
            `Input: \n${input}\n\n\nOutput:\n${inspectedOutput}`,
          );
          return {
            content:
              'The output was too big to fit in a message, here it is in a file instead! ' +
              url,
          };
        } else
          return {
            content: '',
            embeds: [
              {
                color: 0x00ff00,
                title: 'Input',
                description: `\`\`\`ts\n${input}\n\`\`\``,
              },
              {
                color: 0x00ff00,
                title: 'Output',
                description: `\`\`\`ts\n${inspectedOutput}\n\`\`\``,
              },
            ],
          };
      } else if (
        flags.includes(ValidFlags.Raw) &&
        flags.includes(ValidFlags.Embed)
      ) {
        if (inspectedOutput.length > 4096) {
          let url = await uploadOutput(inspectedOutput);
          return {
            content:
              'The output was too big to fit in a message, here it is in a file instead! ' +
              url,
          };
        }
        return {
          content: '',
          embeds: [
            {
              color: 0x00ff00,
              title: 'Output',
              description: `${inspectedOutput}`,
            },
          ],
        };
      } else if (
        flags.includes(ValidFlags.Input) &&
        flags.includes(ValidFlags.Upload)
      ) {
        let url = await uploadOutput(
          `Input: \n${input}\n\n\nOutput:\n${inspectedOutput}`,
        );
        return {
          content: `Uploaded! here's the link: ${url}`,
        };
      }
    }
  }
  logger.warn(`Failed to construct message for eval output.`);
  logger.warn(`Output: ${inspectedOutput}`);
  logger.warn(`Input: ${input}`);
  logger.warn(`Flags: ${flags.join(', ')}`);
  return {
    content:
      'I Failed to construct a message for this output. Check logs for details.',
  };
}

export default async function EvalCommand(message: Message) {
  const args = message.content.split(/(\s(?<!\n))/g);

  if (args[0] !== (isDebug ? 'test!eval' : 'd!eval')) {
    return;
  }
  args.shift();
  args.shift();
  5;

  if (!(await isOwner(message.author.id, true))) {
    client.rest.channels.createMessage(message.channelID, {
      embeds: [
        {
          image: {
            url: 'https://cdn.alekeagle.me/cAPOyKp9Mm.jpg',
          },
        },
      ],
    });
    return;
  }

  let flags: ValidFlags[] = [];
  if (args[0].match(/^-(\w+)$/)) {
    args[0]
      .match(/^-(\w+)$/)![1]
      .split('')
      .forEach((flag) => {
        if (Object.values(ValidFlags).includes(flag as ValidFlags)) {
          flags.push(flag as ValidFlags);
        }
      });
    args.shift();
    args.shift();
  }
  let code = args
    .join('')
    .replace(/(?:(?:```(?:ts|js|javascript|typescript)?\n)|(?:\n```))/gi, '');

  let response: Message | null = null;
  if (!flags.includes(ValidFlags.Quiet)) {
    response = await client.rest.channels.createMessage(message.channelID, {
      content: 'Braining... <a:loading1:470030932775272469>',
    });
  }

  let emitter = evaluateSafe(code, {
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
      if (!flags.includes(ValidFlags.Quiet) || err) {
        let constructedMessage = await constructMessage(
          out,
          code,
          Boolean(err),
          flags,
        );
        if (response) {
          await response.edit(constructedMessage!);
        } else if (constructedMessage) {
          await client.rest.channels.createMessage(
            message.channelID,
            constructedMessage,
          );
        }
      } else {
        await message.createReaction('✅');
      }
    });
    emitter.once('timeoutError', async (error, callback) => {
      const inspectedError: string =
        typeof error === 'string' ? error : inspect(error);

      await client.rest.channels.createMessage(message.channelID, {
        content: `${message.author.mention}, there was an error inside of a \`${callback}\`, it has been forcefully cleared.`,
        embeds: [
          {
            title: 'Error',
            color: 0xff0000,
            description: `\`\`\`ts\n${inspectedError}\n\`\`\``,
          },
        ],
        allowedMentions: {
          users: [message.author.id],
        },
      });
    });
  } else {
    let constructedMessage = await constructMessage(
      emitter,
      code,
      false,
      flags,
    );
    if (response) {
      await response.edit(constructedMessage!);
    } else if (constructedMessage) {
      await client.rest.channels.createMessage(
        message.channelID,
        constructedMessage,
      );
    }
  }
}

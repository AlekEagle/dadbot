import Utils from 'node:util';
import fetch from 'node-fetch';
import FormData from 'form-data';
import Path from 'node:path';
import SourceMapSupport from 'source-map-support';
import VM from 'node:vm';
import { isOwner } from '../utils/Owners';
import { CommandModule } from '../types';
import {
  CompilerOptions,
  ModuleKind,
  ScriptTarget,
  transpileModule
} from 'typescript';
import EventEmitter from 'node:events';
import { Message, MessageContent } from 'eris';

const compilerOptions: CompilerOptions = {
  module: ModuleKind.CommonJS,
  target: ScriptTarget.ES2020,
  esModuleInterop: true,
  sourceMap: true,
  inlineSources: true,
  noImplicitAny: true,
  allowJs: true,
  alwaysStrict: true,
  resolveJsonModule: true
};

function evaluateSafe(code: string, args: any) {
  const emitter = new EventEmitter();

  function safeWrapSetter(
    fn: Function,
    setter: any,
    clearer: any,
    ...args: any
  ) {
    const timeout = setter((...args: any) => {
      try {
        return fn(...args);
      } catch (error) {
        clearer(timeout);
        emitter.emit('timeoutError', error, setter.name);
      }
    }, ...args);
    return timeout;
  }

  const asyncFunctionArgs = Object.entries(
    Object.assign(args, {
      setTimeout: (fn: Function, ...args: any) => {
        return safeWrapSetter(fn, setTimeout, clearTimeout, ...args);
      },
      setInterval: (fn: Function, ...args: any) => {
        return safeWrapSetter(fn, setInterval, clearInterval, ...args);
      },
      setImmediate: (fn: Function, ...args: any) => {
        return safeWrapSetter(fn, setImmediate, clearImmediate, ...args);
      }
    })
  );

  const sourcePathToSource = Object.create(null);
  SourceMapSupport.install({
    environment: 'node',
    retrieveFile: sourcePath => sourcePathToSource[sourcePath]
  });
  const tsPath = Path.resolve('input.ts');
  let transpiledStr = transpileModule(code, {
    compilerOptions,
    fileName: tsPath,
    moduleName: 'input'
  });
  const jsPath = Path.resolve('input.js');
  sourcePathToSource[jsPath] = transpiledStr.outputText;
  sourcePathToSource[Path.resolve('input.js.map')] =
    transpiledStr.sourceMapText;
  const funArgs: { [key: string]: any } = {};
  asyncFunctionArgs.forEach(a => (funArgs[a[0]] = a[1]));
  VM.createContext(funArgs);
  let evalFn: any;
  try {
    evalFn = VM.runInContext(transpiledStr.outputText, funArgs, {
      filename: jsPath
    });
  } catch (e) {
    return e;
  }
  Promise.resolve()
    .then(() => {
      let promise;
      try {
        promise = evalFn(...asyncFunctionArgs.map(arg => arg[1]));
      } catch (err) {
        emitter.emit('complete', err, true);
      }
      return promise;
    })
    .then(
      thing => {
        emitter.emit('complete', thing, false);
      },
      thing => {
        emitter.emit('complete', thing, true);
      }
    );
  return emitter;
}

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
        return inspectedOutput;
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
    let evalStr: string;
    if (args[0].match(/^-(\w+)$/)) {
      options = args[0].match(/^-(\w+)$/)[1].split('');
      args.shift();
      args.shift();
    }

    let imports = args.join('').match(/import .+\n/gi);

    evalStr = `${
      imports && imports.length > 0 ? `${imports.join('')}\n` : ''
    }(async function () {
  ${args
    .join('')
    .replace(/(?:(?:```(?:ts|js|javascript|typescript)?\n)|(?:\n```))/gi, '')
    .replace(/import .+\n/gi, '')
    .split('\n')
    .join('\n  ')
    .replace('\n  ', '')}
});`;

    let message: Message = null;
    if (!options.includes('q'))
      message = await msg.channel.createMessage(
        'Braining... <a:loading1:470030932775272469>'
      );
    let emitter = evaluateSafe(evalStr, {
      client,
      msg,
      args,
      require,
      exports,
      console
    });
    if (emitter instanceof EventEmitter) {
      emitter.once('complete', async (out, err) => {
        if (!options.includes('q') || err)
          await message.edit(
            await constructMessage(out, evalStr, err, options, msg)
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
        await constructMessage(emitter, evalStr, true, options, msg)
      );
    }
  },
  options: {
    removeWhitespace: false,
    whitespaceSeparator: /(\s(?<!\n))/g
  }
};
export default __command;

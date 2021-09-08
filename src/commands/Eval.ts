import Utils from 'node:util';
import fetch from 'node-fetch';
import FormData from 'form-data';
import Path from 'node:path';
import SourceMapSupport from 'source-map-support';
import { Message } from 'eris';
import VM from 'node:vm';
import ECH from 'eris-command-handler';
import { addOwner, isOwner } from '../utils/Owners';
import { CommandModule } from '../types';
import {
  CompilerOptions,
  ModuleKind,
  ScriptTarget,
  transpileModule
} from 'typescript';
import EventEmitter from 'node:events';

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
  const tsPath = Path.resolve('eval.ts');
  let transpiledStr = transpileModule(code, {
    compilerOptions,
    fileName: tsPath,
    moduleName: 'eval'
  });
  const jsPath = Path.resolve('eval.js');
  sourcePathToSource[jsPath] = transpiledStr.outputText;
  sourcePathToSource[Path.resolve('eval.js.map')] = transpiledStr.sourceMapText;
  const funArgs: { [key: string]: any } = {};
  asyncFunctionArgs.forEach(a => (funArgs[a[0]] = a[1]));
  VM.createContext(funArgs);
  const evalFn = VM.runInContext(transpiledStr.outputText, funArgs, {
    filename: jsPath
  });
  Promise.resolve()
    .then(() => {
      let promise;
      try {
        promise = evalFn(...asyncFunctionArgs.map(arg => arg[1]));
      } catch (err) {
        console.error(err);
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
    let options: string[] = [];
    let evalStr: string;
    if (args[0].match(/^-(\w+)$/)) {
      options = args[0].match(/^-(\w+)$/)[1].split('');
      args.shift();
    }

    let imports = args.join(' ').match(/^import .+$/gim);

    evalStr = `${
      imports.length > 0 ? `${imports.join('\n')}\n` : ''
    }(async function () {
      ${args
        .join(' ')
        .replace(
          /(?:(?:^```(?:ts|js|javascript|typescript)?\n)|(?:\n```$))/gi,
          ''
        )
        .replace(/^import .+$/gim, '')}
      });`;

    await msg.channel.sendTyping();
    let emitter = evaluateSafe(evalStr, {
      client,
      msg,
      args,
      require,
      exports
    });
    emitter.once('complete', (out, err) => {
      const inspectedOut: string =
        typeof out !== 'string' ? Utils.inspect(out) : out;
      msg.channel.createMessage(
        `\`\`\`${err ? '' : 'ts'}\n${inspectedOut}\n\`\`\``
      );
    });
  },
  options: {
    removeWhitespace: true,
    whitespaceSeparator: /(\s(?<!\n))/g
  }
};
export default __command;

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
      imports && imports.length > 0 ? `${imports.join('\n')}\n` : ''
    }(async function () {
      ${args
        .join(' ')
        .replace(
          /(?:(?:^```(?:ts|js|javascript|typescript)?\n)|(?:\n```$))/gi,
          ''
        )
        .replace(/^import .+$/gim, '')}
});`;

    let message = await msg.channel.createMessage(
      'Braining... <a:loading1:470030932775272469>'
    );
    let emitter = evaluateSafe(evalStr, {
      client,
      msg,
      args,
      require,
      exports
    });
    if (emitter instanceof EventEmitter) {
      emitter.once('complete', (out, err) => {
        const inspectedOut: string =
          typeof out !== 'string' ? Utils.inspect(out) : out;
        message.edit(
          err
            ? `Input: \`\`\`ts\n${evalStr}\n\`\`\`\nOutput: \`\`\`\n${inspectedOut}\n\`\`\``
            : `\`\`\`ts\n${inspectedOut}\n\`\`\``
        );
      });
      emitter.once('timeoutError', (error, cb) => {
        const inspectedOut: string =
          typeof error !== 'string' ? Utils.inspect(error) : error;
        message.edit(
          `Hmm, it seems there was an error inside a ${cb} callback, its been cleared. Here's the error:\n\`\`\`\n${inspectedOut}\n\`\`\``
        );
      });
    } else {
      const inspectedOut: string =
        typeof emitter !== 'string' ? Utils.inspect(emitter) : emitter;
      message.edit(
        `Input: \`\`\`ts\n${evalStr}\n\`\`\`\nOutput: \`\`\`\n${inspectedOut}\n\`\`\``
      );
    }
  },
  options: {
    removeWhitespace: true,
    whitespaceSeparator: /(\s(?<!\n))/g
  }
};
export default __command;

import Path from 'node:path';
import SourceMapSupport from 'source-map-support';
import VM from 'node:vm';
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

export default function evaluateSafe(code: string, args: any) {
  let evalStr: string;
  let imports = code.match(/import .+\n/gi);
  evalStr = `${
    imports && imports.length > 0 ? `${imports.join('')}\n` : ''
  }(async function () {
  ${code
    .replace(/import .+\n/gi, '')
    .split('\n')
    .join('\n  ')
    .replace('\n  ', '')}
});`;
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
  let transpiledStr = transpileModule(evalStr, {
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

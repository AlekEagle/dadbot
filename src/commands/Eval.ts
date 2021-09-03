import Utils from 'node:util';
import fetch from 'node-fetch';
import FormData from 'form-data';
import EventEmitter from 'node:events';

const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;

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

  const evalFn = new AsyncFunction(
    ...asyncFunctionArgs.map(arg => arg[0]),
    `${code}`
  );
  Promise.resolve()
    .then(() => evalFn(...asyncFunctionArgs.map(arg => arg[1])))
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

import Chalk from 'chalk';
import * as InternalConsole from 'console';
import * as NodeUtil from 'util';
export enum Level {
  NONE = 0,
  ERROR = 1,
  WARN = 2,
  INFO = 3,
  DEBUG = 4
}
function addZero(n: number): string {
  return n >= 0 && n < 10 ? '0' + n : n + '';
}
function date(): string {
  let now = new Date();
  return [
    [
      addZero(now.getDate()),
      addZero(now.getMonth() + 1),
      now.getFullYear()
    ].join('/'),
    [
      addZero(now.getHours()),
      addZero(now.getMinutes()),
      addZero(now.getSeconds())
    ].join(':')
  ].join(' ');
}

type LoggerConstructor = Level | 'none' | 'error' | 'warn' | 'info' | 'debug';

export default class Logger {
  private __logLevel: Level;
  private timestamp: boolean;
  get logLevel(): Level {
    return this.__logLevel;
  }

  constructor(logLevel: LoggerConstructor, timestamps: boolean = true) {
    this.timestamp = timestamps;
    if (typeof logLevel === 'string') {
      switch (logLevel as string) {
        case 'none':
          this.__logLevel = Level.NONE;
          break;
        case 'error':
          this.__logLevel = Level.ERROR;
          break;
        case 'warn':
          this.__logLevel = Level.WARN;
          break;
        case 'info':
          this.__logLevel = Level.INFO;
          break;
        case 'debug':
          this.__logLevel = Level.DEBUG;
          break;
      }
    } else this.__logLevel = logLevel as Level;
  }

  error(message: any, ...optionalParams: any[]) {
    if (this.logLevel < Level.ERROR) return;
    InternalConsole.log(
      `${this.timestamp ? `${Chalk.bgBlue(date())} ` : ''}${Chalk.rgb(
        214,
        78,
        207
      )('[ERROR]')} ${Chalk.reset(
        typeof message !== 'string' ? NodeUtil.inspect(message) : message
      )}`,
      optionalParams.length > 0
        ? optionalParams
            .map(p => (typeof p !== 'string' ? NodeUtil.inspect(p) : p))
            .join(' ')
        : ''
    );
  }

  warn(message: any, ...optionalParams: any[]) {
    if (this.logLevel < Level.WARN) return;
    InternalConsole.log(
      `${this.timestamp ? `${Chalk.bgBlue(date())} ` : ''}${Chalk.rgb(
        177,
        170,
        55
      )('[WARN]')} ${Chalk.reset(
        typeof message !== 'string' ? NodeUtil.inspect(message) : message
      )}`,
      optionalParams.length > 0
        ? optionalParams
            .map(p => (typeof p !== 'string' ? NodeUtil.inspect(p) : p))
            .join(' ')
        : ''
    );
  }

  log(message: any, ...optionalParams: any[]) {
    if (this.logLevel < Level.INFO) return;
    InternalConsole.log(
      `${this.timestamp ? `${Chalk.bgBlue(date())} ` : ''}${Chalk.rgb(
        47,
        184,
        55
      )('[INFO]')} ${Chalk.reset(
        typeof message !== 'string' ? NodeUtil.inspect(message) : message
      )}`,
      optionalParams.length > 0
        ? optionalParams
            .map(p => (typeof p !== 'string' ? NodeUtil.inspect(p) : p))
            .join(' ')
        : ''
    );
  }

  info(message: any, ...optionalParams: any[]) {
    this.log(message, ...optionalParams);
  }

  debug(message: any, ...optionalParams: any[]) {
    if (this.logLevel < Level.DEBUG) return;
    InternalConsole.log(
      `${this.timestamp ? `${Chalk.bgBlue(date())} ` : ''}${Chalk.rgb(
        74,
        69,
        220
      )('[DEBUG]')} ${Chalk.reset(
        typeof message !== 'string' ? NodeUtil.inspect(message) : message
      )}`,
      optionalParams.length > 0
        ? optionalParams
            .map(p => (typeof p !== 'string' ? NodeUtil.inspect(p) : p))
            .join(' ')
        : ''
    );
  }

  trace(message: any, ...optionalParams: any[]) {
    if (this.logLevel > Level.DEBUG) return;
    InternalConsole.trace(
      `${this.timestamp ? `${Chalk.bgBlue(date())} ` : ''}${Chalk.rgb(
        30,
        186,
        198
      )('[DEBUG]')} ${Chalk.reset(
        typeof message !== 'string' ? NodeUtil.inspect(message) : message
      )}`,
      optionalParams.length > 0
        ? optionalParams
            .map(p => (typeof p !== 'string' ? NodeUtil.inspect(p) : p))
            .join(' ')
        : ''
    );
  }
}

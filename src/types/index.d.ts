import Eris from 'eris';
import ECH from 'eris-command-handler';
import Logger from '../utils/Logger';
declare namespace NodeJS {
  export interface ProcessEnv {
    token: string;
    otherToken: string;
    topGGToken: string;
    iftttToken: string;
    webhookToken: string;
    serverPass: string;
    perspectiveKey: string;
    grafanaToken: string;
    alekeagleMEToken: string;
    DEBUG: string;
  }
}

declare const console: Logger;

declare type CommandModuleGeneratorFunction = (
  client: ECH.CommandClient,
  msg: Eris.Message,
  args: string[]
) => ECH.GeneratorFunctionReturn;

declare type CommandModuleGenerator =
  | CommandModuleGeneratorFunction
  | Eris.MessageContent;

declare interface CommandModule {
  name: string;

  handler: CommandModuleGenerator;

  options?: ECH.CommandOptions;
}

declare interface EventModule {
  name: string;

  handler: (client: ECH.CommandClient, ...args: any[]) => void;
}

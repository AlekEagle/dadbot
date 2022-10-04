import ECH from 'eris-command-handler';
import Eris from 'eris';

export {};

declare global {
  export type CommandModuleGeneratorFunction = (
    msg: Eris.Message,
    args: string[]
  ) => ECH.GeneratorFunctionReturn;

  export type CommandModuleGenerator =
    | CommandModuleGeneratorFunction
    | Eris.MessageContent;

  export interface CommandModule {
    name: string;

    handler: CommandModuleGenerator;

    options?: ECH.CommandOptions;
  }

  export interface EventModule {
    name: string;

    handler: (...args: any[]) => void;
  }
}

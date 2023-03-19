import { Interaction, Client, CommandInteraction } from "oceanic.js";
import _Command from "./Command";
import {
  OptionParameter as _OptionParameter,
  Options as _Options,
  OptionChoice as _OptionChoice,
  OptionBuilder as _OptionBuilder,
} from "./OptionBuilder";

export default class CommandHandler {
  private _commands: _Command<any>[] = [];

  constructor(private _client: Client) {
    this._client.on("interactionCreate", this.handleInteraction.bind(this));
  }

  public registerSlashCommand(command: _Command<any>): this {
    this._commands.push(command);
    const announceToDiscord = () => {
      this._client.application.createGlobalCommand(command.toInteraction);
    };
    if (!this._client.shards.some((s) => s.ready)) {
      this._client.once("shardReady", announceToDiscord);
    } else {
      announceToDiscord();
    }

    return this;
  }

  private async handleInteraction(interaction: Interaction) {
    if (interaction instanceof CommandInteraction) {
      const command = this._commands.find(
        (c) => c.name === interaction.data.name
      );
      if (command == null) return;
      else await command.handleInteraction(interaction);
    }
  }
}

export const Command = _Command;
export type OptionParameter = _OptionParameter;
export type Options<P extends OptionParameter[]> = _Options<P>;
export type OptionChoice<T> = _OptionChoice<T>;
export const OptionBuilder = _OptionBuilder;

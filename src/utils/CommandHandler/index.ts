import {
  Interaction,
  Client,
  CommandInteraction,
  AnyInteraction,
} from "oceanic.js";
import { Command, CommandSettings } from "./Command";
import { OptionParameter, Options } from "./OptionBuilder";

export default class CommandHandler {
  private _commands: Map<string, Command<{}>> = new Map();

  constructor(private _client: Client) {
    this._client.on("interactionCreate", this.handleInteraction.bind(this));
  }

  public register(name: string, command: Command<{}>): void;
  public register<P extends { [option: string]: OptionParameter }>(
    name: string,
    args: Command<P> | CommandSettings<P>,
    handler: (args: any, interaction: AnyInteraction) => void
  ): void;
  public register<P extends { [option: string]: OptionParameter }>(
    name: string,
    args: Command<P> | CommandSettings<P>,
    handler?: (args: Options<P>, interaction: AnyInteraction) => void
  ) {
    const command = args instanceof Command ? args : new Command(args, handler);
    this._commands.set(name, command);
  }

  private async handleInteraction(interaction: Interaction) {
    if (interaction instanceof CommandInteraction) {
      const command = this._commands.get(interaction.data.name);
      if (command == null)
        throw new Error(
          "WHAT THE FUCK BOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOHOHOHOHOHOHOHOAHAHAHAHOHOOHAHAHAHAH"
        );

      await command.handleInteraction(interaction);
    }
  }
}

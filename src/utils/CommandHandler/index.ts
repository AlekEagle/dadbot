import {
  Interaction,
  Client,
  CommandInteraction,
  ApplicationCommandTypes,
} from "oceanic.js";
import { Command, CommandSettings } from "./Command";
import { OptionParameter, Options } from "./OptionBuilder";

export default class CommandHandler {
  private _commands: Map<string, Command<{}>> = new Map();

  constructor(private _client: Client) {
    this._client.on("interactionCreate", this.handleInteraction.bind(this));
  }

  public registerSlashCommand(name: string, command: Command<{}>): void;
  public registerSlashCommand<P extends { [option: string]: OptionParameter }>(
    name: string,
    args: Command<P> | CommandSettings<P>,
    handler: (args: Options<P>, interaction: CommandInteraction) => void
  ): void;
  public registerSlashCommand<P extends { [option: string]: OptionParameter }>(
    name: string,
    args: Command<P> | CommandSettings<P>,
    handler?: (args: Options<P>, interaction: CommandInteraction) => void
  ) {
    const command = args instanceof Command ? args : new Command(args, handler);
    this._commands.set(name, command);
    const announceToDiscord = () => {
      this._client.application.createGlobalCommand({
        name,
        type: ApplicationCommandTypes.CHAT_INPUT,
        ...command.settings,
      });
    };
    // Announce to Discord that we have a new command.
    // Client#application isn't present if there isn't a shard ready, check if there is one.
    // If there isn't, wait for one to be ready.
    if (!this._client.shards.some((s) => s.ready)) {
      this._client.once("shardReady", announceToDiscord);
    } else {
      announceToDiscord();
    }
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

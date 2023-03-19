import {
  CommandInteraction,
  ApplicationCommandOptionTypes,
  Constants,
} from "oceanic.js";
import { OptionParameter, Options } from "./OptionBuilder";

export default class Command<P extends Array<OptionParameter>> {
  constructor(
    private _name: string,
    private _description: string,
    private _handler: (
      args: Options<P>,
      interaction: CommandInteraction
    ) => void | Promise<void>,
    private _params?: P,
    private _options?: any
  ) {}

  public get name() {
    return this._name;
  }

  public get description() {
    return this._description;
  }

  public get params() {
    return this._params;
  }

  public get options() {
    return this._options;
  }

  public get toInteraction() {
    return {
      type: Constants.ApplicationCommandTypes.CHAT_INPUT,
      name: this._name,
      description: this._description,
      options: this._params,
      ...this._options,
    };
  }

  public async handleInteraction(interaction: CommandInteraction) {
    // Setup runtime blah blah blah.

    const options = ConvertInteractionOptions(this._params, interaction);

    await this._handler(options, interaction);
  }
}

function ConvertInteractionOptions<P extends OptionParameter[]>(
  schema: P,
  interaction: CommandInteraction
): Options<P> {
  interaction.client;
  const options: any = {};
  for (const option of interaction.data.options.raw) {
    if (
      // @ts-ignore We'll add this later, stinky.
      schema.find((s) => s.name === option.name)?.type ==
        ApplicationCommandOptionTypes.SUB_COMMAND ||
      // @ts-ignore
      schema.find((s) => s.name === option.name)?.type ==
        ApplicationCommandOptionTypes.SUB_COMMAND_GROUP
    ) {
      continue;
    } else if (!schema.find((s) => s.name == option.name)) {
      throw new Error("Discord sent an option that was not in the schema.");
    } else if (schema.find((s) => s.name == option.name).type !== option.type) {
      throw new Error(
        "Discord sent an option that was in the schema but doesn't match the type in the schema."
      );
    } else {
      options[option.name] = option.value;
    }
  }

  return options;
}

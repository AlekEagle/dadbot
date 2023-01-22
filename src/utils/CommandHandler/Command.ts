import { CommandInteraction, ApplicationCommandOptionTypes } from "oceanic.js";
import { OptionBuilder, OptionParameter, Options } from "./OptionBuilder";

export type CommandSettings<P extends { [option: string]: OptionParameter }> = {
  description: string;
  options: P;
};

export class Command<P extends { [option: string]: OptionParameter }> {
  constructor(
    private _settings: CommandSettings<P>,
    private _handler: (
      args: Options<P>,
      interaction: CommandInteraction
    ) => void
  ) {}

  async handleInteraction(interaction: CommandInteraction) {
    // Setup runtime blah blah blah.

    // Convert interaction options to a nice object.
    const options = ConvertInteractionOptions(
      this._settings.options,
      interaction
    );

    this._handler(options, interaction);
  }

  public get settings() {
    // We need to take our KV pairs and turn them into an array of objects.
    // This is because Discord expects an array of objects.
    const options = Object.entries(this._settings.options).map(
      ([key, value]) => {
        return {
          name: key,
          description: value.description,
          type: value.type,
          required: value.required,
        };
      }
    );

    return {
      description: this._settings.description,
      options,
    };
  }
}

function ConvertInteractionOptions<
  P extends { [option: string]: OptionParameter }
>(schema: P, interaction: CommandInteraction): Options<P> {
  interaction.client;
  const options: any = {};
  for (const option of interaction.data.options.raw) {
    if (
      // @ts-ignore We'll add this later, stinky.
      schema[option.name].type == ApplicationCommandOptionTypes.SUB_COMMAND ||
      // @ts-ignore
      schema[option.name].type ==
        ApplicationCommandOptionTypes.SUB_COMMAND_GROUP
    ) {
      continue;
    } else if (!schema[option.name]) {
      throw new Error(
        "Discord sent an option that was not in the schema. What a bitch."
      );
    } else if (schema[option.name].type != option.type) {
      throw new Error(
        "Discord sent an option that was in the schema but doesn't match the type in the schema. What a bitch."
      );
    } else {
      options[option.name] = option.value;
    }
  }

  return options;
}

// idk
const l = new Command(
  {
    description: "big goofy butt balls",
    options: {
      message: {
        type: 3,
        description: "My balls itch.",
        required: true,
      },
    },
  },
  (a) => {
    console.log("A", a.message);
  }
);

import {
  AnyInteraction,
  CommandInteraction,
  InteractionOptionsWithValue,
} from "oceanic.js";
import { OptionBuilder, OptionParameter, Options } from "./OptionBuilder";

export type CommandSettings<P extends { [option: string]: OptionParameter }> = {
  description: string;
  options: P;
};

export class Command<P extends { [option: string]: OptionParameter }> {
  constructor(
    private _settings: CommandSettings<P>,
    private _handler: (args: Options<P>, interaction: AnyInteraction) => void
  ) {
    console.log("I am a great question.");
  }

  async handleInteraction(interaction: CommandInteraction) {
    // Setup runtime blah blah blah.
    this._handler(interaction.data.options, interaction);
  }
}

function ConvertInteractionOptions<
  P extends { [option: string]: OptionParameter }
>(schema: P, interaction: CommandInteraction): Options<P> {
  const options: any = {};
  for (const option of interaction.data.options.raw) {
    if (option instanceof InteractionOptionsWithValue)
      options[option.name] = option.value;
  }
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

/*
export interface Events {
  authenticated: (id: number, totalClusters: number, user: string) => void;
  data: (
    id: number,
    data: Data,
    cb: (success: boolean, code?: GenericCloseCodes) => void
  ) => void;
  disconnected: (cluster: number, code: number | Error) => void;
}

export interface ServerService extends EventEmitter {
  on<U extends keyof Events>(event: U, listener: Events[U]): this;
  once<U extends keyof Events>(event: U, listener: Events[U]): this;
  off<U extends keyof Events>(event: U, listener: Events[U]): this;
  addListener<U extends keyof Events>(event: U, listener: Events[U]): this;
  emit<U extends keyof Events>(
    event: U,
    ...args: Parameters<Events[U]>
  ): boolean;
  name: string;
  getCluster(id: number): Cluster;
  getAllClusters(): { [key: number]: Cluster };
  disconnectCluster(id: number, code: GenericCloseCodes): void;
  serverClosing(): void;
  dataPushed(): void;
}
*/

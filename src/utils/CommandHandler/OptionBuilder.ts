import { User, Member, Constants } from "oceanic.js";

export type OptionChoice<T> = {
  name: string;
  value: T;
};

export type Options<P extends OptionParameter[]> = {
  [K in P[number]["name"]]: P[number]["type"] extends Constants.ApplicationCommandOptionTypes.STRING
    ? string
    : P[number]["type"] extends Constants.ApplicationCommandOptionTypes.INTEGER
    ? number
    : P[number]["type"] extends Constants.ApplicationCommandOptionTypes.USER
    ? User | Member
    : never;
};

export type OptionParameter = (
  | { type: 3 }
  | { type: 3; min_length: number; max_length: number }
  | { type: 3; choices: OptionChoice<string>[] }
  | { type: 4 }
  | { type: 4; choices: OptionChoice<number>[] }
  | { type: 4; max_value?: number; min_value?: number }
  | { type: 6 }
) & { name: string; description: string; required: boolean };

export namespace OptionBuilder {
  export function String(
    name: string,
    description: string,
    required: boolean = true,
    options:
      | { choices: OptionChoice<string>[] }
      | { min_length?: number; max_length?: number } = {}
  ): OptionParameter {
    return {
      name,
      type: Constants.ApplicationCommandOptionTypes.STRING,
      description,
      required,
      ...options,
    };
  }

  export function Number(
    name: string,
    description: string,
    required: boolean = true,
    options:
      | { choices: OptionChoice<number>[] }
      | { min_value?: number; max_value?: number } = {}
  ): OptionParameter {
    return {
      name,
      type: Constants.ApplicationCommandOptionTypes.INTEGER,
      description,
      required,
      ...options,
    };
  }

  export function User(
    name: string,
    description: string,
    required: boolean = true
  ): OptionParameter {
    return {
      name,
      type: Constants.ApplicationCommandOptionTypes.USER,
      description,
      required,
    };
  }
}

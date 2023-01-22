import { User, Member } from "oceanic.js";

export type OptionChoice<T> = {
  name: string;
  value: T;
};

export type Options<P extends { [option: string]: OptionParameter }> = {
  [K in keyof P]: P[K] extends { type: 3 }
    ? string
    : P[K] extends { type: 4 }
    ? number
    : P[K] extends { type: 6 }
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
) & { description: string; required: boolean };

export namespace OptionBuilder {
  export function String(
    description: string,
    required: boolean = true,
    options:
      | { choices: OptionChoice<string>[] }
      | { min_length: number; max_length: number }
      | {} = {}
  ): OptionParameter {
    return { type: 3, description, required, ...options };
  }

  export function Number(
    description: string,
    required: boolean = true,
    options:
      | { choices: OptionChoice<number>[] }
      | { min_value?: number; max_value?: number }
      | {} = {}
  ): OptionParameter {
    return { type: 4, description, required, ...options };
  }
}

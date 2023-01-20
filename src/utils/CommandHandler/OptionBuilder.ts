export type OptionChoice<T> = {
  name: string;
  value: T;
};

export type Options<P extends { [option: string]: OptionParameter }> = {
  [K in keyof P]: P[K] extends { type: 3 }
    ? string
    : P[K] extends { type: 4 }
    ? number
    : never;
};

export type OptionParameter = (
  | { type: 3 }
  | { type: 3; min_length: number; max_length: number }
  | { type: 3; choices: OptionChoice<string>[] }
  | { type: 4 }
  | { type: 4; choices: OptionChoice<number>[] }
  | { type: 4; max_value?: number; min_value?: number }
) & { description: string; required: boolean };

export namespace OptionBuilder {
  export function String(
    description: string,
    required: boolean,
    options: any
  ): OptionParameter {
    return { type: 3, description, required };
  }
}

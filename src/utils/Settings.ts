import Options from './DB/Options';

export enum Flags {
  IM_RESPONSES = 1 << 0,
  KYS_RESPONSES = 1 << 1,
  SHUT_UP_RESPONSES = 1 << 2,
  WINNING_RESPONSES = 1 << 3,
  GOODBYE_RESPONSES = 1 << 4,
  THANKS_RESPONSES = 1 << 5,
  SHOUTING_RESPONSES = 1 << 6
}

export interface SettingsDataRtnValue {
  flags: Flags;
  RNG: number | null;
  id: string;
}

export interface SettingsDataSetValue {
  flags: Flags;
  RNG: number | null;
}

const defaultSettings: SettingsDataSetValue = {
  flags:
    Flags.IM_RESPONSES |
    Flags.KYS_RESPONSES |
    Flags.SHUT_UP_RESPONSES |
    Flags.WINNING_RESPONSES | 
    Flags.GOODBYE_RESPONSES |
    Flags.THANKS_RESPONSES |
    Flags.SHOUTING_RESPONSES,
  RNG: null
};

export async function getValueByID(id: string): Promise<SettingsDataRtnValue> {
  let res = await Options.findOne({
    where: {
      id
    }
  });
  if (!res) return { ...defaultSettings, id };
  return { flags: res.flags, RNG: res.RNG, id: res.id };
}

export async function setValueByID(
  id: string,
  value?: SettingsDataSetValue
): Promise<SettingsDataRtnValue> {
  if (
    !value ||
    (value.flags === defaultSettings.flags && value.RNG === defaultSettings.RNG)
  ) {
    (
      await Options.findOne({
        where: {
          id
        }
      })
    ).destroy();
    return { ...defaultSettings, id };
  } else {
    let res = await Options.findOne({
      where: {
        id
      }
    });
    if (!res) {
      let created = await Options.create({
        id,
        flags: value.flags,
        RNG: value.RNG
      });
      return {
        flags: created.flags,
        RNG: created.RNG === 1 ? null : created.RNG,
        id
      };
    } else {
      let updated = await res.update({ ...value });
      return {
        flags: updated.flags,
        RNG: updated.RNG === 1 ? null : updated.RNG,
        id
      };
    }
  }
}

export const StringIsNumber = (value: string) =>
  !isNaN(Number(value)) && isFinite(Number(value));

export function enumToArray(val: any): Array<string> {
  return Object.keys(val)
    .filter(StringIsNumber)
    .map((k: keyof typeof val) => val[k]) as unknown as string[];
}

export function gcd(a: number, b: number) {
  a = Math.abs(a);
  b = Math.abs(b);
  if (b > a) {
    let temp = a;
    a = b;
    b = temp;
  }
  while (true) {
    if (b === 0) return a;
    a %= b;
    if (a === 0) return b;
    b %= a;
  }
}

export function decimalToFraction(decimal: number): number[] {
  let strVal = decimal.toString();
  if (!strVal.includes('.')) return [decimal, 1];
  let strDecimal = strVal.replace(/\d+[.]/, '');
  let pow = Math.pow(10, strDecimal.length);
  return bestFrac(Number(strDecimal), pow);
}

export function bestFrac(n: number, m: number) {
  var tol = 1 / m;
  var val = n / m;
  var best = 1e9;
  var bestden = 0;
  for (var den = 1; den <= 100; den++) {
    var num = Math.round(val * den);
    var diff = Math.abs(num / den - val);
    var score = diff / tol - 1 / Math.sqrt(den);
    if (score < best) {
      var best = score;
      var bestden = den;
    }
  }
  return [Math.round(val * bestden), bestden];
}

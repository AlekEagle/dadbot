import Options from './DB/Options';
import { GuildChannel, Message } from 'eris';

export enum Flags {
  IM_RESPONSES = 1 << 0,
  KYS_RESPONSES = 1 << 1,
  SHUT_UP_RESPONSES = 1 << 2,
  WINNING_RESPONSES = 1 << 3,
  GOODBYE_RESPONSES = 1 << 4,
  THANKS_RESPONSES = 1 << 5,
  SHOUTING_RESPONSES = 1 << 6
}

function kvsFromEnum(enumObj: any): { [key: string]: number | string } {
  const keys = Object.keys(enumObj).filter(
      k =>
        typeof enumObj[k] === 'number' ||
        enumObj[k] === k ||
        enumObj[enumObj[k]]?.toString() !== k
    ),
    kvs: { [key: string]: number | string } = {};
  for (const key of keys) {
    kvs[key] = enumObj[key];
  }
  return kvs;
}

export function flagsToNumber(flags: Array<keyof typeof Flags>): Flags {
  let num = 0;
  for (const flag of flags) {
    num |= Flags[flag];
  }
  return num;
}

export function numberToFlags(num: number): Array<keyof typeof Flags> {
  const flags: Array<keyof typeof Flags> = [];
  for (const flag in Flags) {
    if (Flags[flag as keyof typeof Flags] & num) {
      flags.push(flag as keyof typeof Flags);
    }
  }
  return flags;
}

export interface SettingsConfigObject {
  flags: Flags;
  RNG: number | null;
  default: boolean;
  id?: string | null;
}

export type SettingsConfigParam = Omit<SettingsConfigObject, 'id' | 'default'>;

export interface SettingsHierarchyObject {
  user: SettingsConfigObject;
  channel: SettingsConfigObject;
  guild?: SettingsConfigObject;
  preferred: 'user' | 'channel' | 'guild';
}

export interface ComputedSettingsObject {
  value: SettingsConfigObject;
  inheritedFrom: {
    flags: 'user' | 'channel' | 'guild' | 'default';
    RNG: 'user' | 'channel' | 'guild' | 'default';
  };
}

const defaultSettings: SettingsConfigParam = {
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

export async function getUserSettings(
  id: string
): Promise<SettingsConfigObject> {
  const user = await Options.findOne({
    where: {
      id
    }
  });
  if (!user) return { ...defaultSettings, id, default: true };
  else return { flags: user.flags, RNG: user.RNG, id, default: false };
}

export async function getChannelSettings(
  id: string
): Promise<SettingsConfigObject> {
  const channel = await Options.findOne({
    where: {
      id
    }
  });
  if (!channel) return { ...defaultSettings, id, default: true };
  else return { flags: channel.flags, RNG: channel.RNG, id, default: false };
}

export async function getGuildSettings(
  id: string
): Promise<SettingsConfigObject> {
  const guild = await Options.findOne({
    where: {
      id
    }
  });
  if (!guild) return { ...defaultSettings, id, default: true };
  else return { flags: guild.flags, RNG: guild.RNG, id, default: false };
}

export async function getComputedSettings(
  msg: Message
): Promise<ComputedSettingsObject> {
  const user = await getUserSettings(msg.author.id);
  const channel = await getChannelSettings(msg.channel.id);
  const guild =
    msg.channel instanceof GuildChannel
      ? await getGuildSettings(msg.channel.guild.id)
      : null;
  const RNG = user.RNG ?? channel.RNG ?? guild?.RNG ?? defaultSettings.RNG;
  const inheritedRNGFrom = user.RNG
    ? 'user'
    : channel.RNG
    ? 'channel'
    : guild?.RNG
    ? 'guild'
    : 'default';
  const inheritedFlagsFrom = !user.default
    ? 'user'
    : !channel.default
    ? 'channel'
    : !guild?.default
    ? 'guild'
    : 'default';
  const flags = !user.default
    ? user.flags
    : !channel.default
    ? channel.flags
    : !guild?.default
    ? guild.flags
    : defaultSettings.flags;
  const value = {
    flags,
    RNG,
    default: false
  };
  return {
    value,
    inheritedFrom: {
      flags: inheritedFlagsFrom,
      RNG: inheritedRNGFrom
    }
  };
}

export async function setUserSettings(
  id: string,
  flags?: Flags,
  RNG?: number | null
): Promise<SettingsConfigObject> {
  const user = await Options.findOne({
    where: {
      id
    }
  });

  if (!user) {
    if (
      (flags === undefined || flags === defaultSettings.flags) &&
      (RNG === undefined || RNG === defaultSettings.RNG)
    )
      return { ...defaultSettings, id, default: true };
    else {
      await Options.create({
        id,
        flags: flags ?? defaultSettings.flags,
        RNG: RNG ?? defaultSettings.RNG
      });
      return {
        flags: flags ?? defaultSettings.flags,
        RNG: RNG ?? defaultSettings.RNG,
        id,
        default: false
      };
    }
  } else {
    if (
      (flags === undefined || flags === defaultSettings.flags) &&
      (RNG === undefined || RNG === defaultSettings.RNG)
    ) {
      await Options.destroy({
        where: {
          id
        }
      });
      return { ...defaultSettings, id, default: true };
    } else {
      await Options.update(
        {
          flags: flags ?? user.flags,
          RNG: RNG ?? user.RNG
        },
        {
          where: {
            id
          }
        }
      );
      return {
        flags: flags ?? user.flags,
        RNG: RNG ?? user.RNG,
        id,
        default: false
      };
    }
  }
}

export async function setChannelSettings(
  id: string,
  flags?: Flags,
  RNG?: number | null
): Promise<SettingsConfigObject> {
  const channel = await Options.findOne({
    where: {
      id
    }
  });

  if (!channel) {
    if (
      (flags === undefined || flags === defaultSettings.flags) &&
      (RNG === undefined || RNG === defaultSettings.RNG)
    )
      return { ...defaultSettings, id, default: true };
    else {
      await Options.create({
        id,
        flags: flags ?? defaultSettings.flags,
        RNG: RNG ?? defaultSettings.RNG
      });
      return {
        flags: flags ?? defaultSettings.flags,
        RNG: RNG ?? defaultSettings.RNG,
        id,
        default: false
      };
    }
  } else {
    if (
      (flags === undefined || flags === defaultSettings.flags) &&
      (RNG === undefined || RNG === defaultSettings.RNG)
    ) {
      await Options.destroy({
        where: {
          id
        }
      });
      return { ...defaultSettings, id, default: true };
    } else {
      await Options.update(
        {
          flags: flags ?? channel.flags,
          RNG: RNG ?? channel.RNG
        },
        {
          where: {
            id
          }
        }
      );
      return {
        flags: flags ?? channel.flags,
        RNG: RNG ?? channel.RNG,
        id,
        default: false
      };
    }
  }
}

export async function setGuildSettings(
  id: string,
  flags?: Flags,
  RNG?: number | null
): Promise<SettingsConfigObject> {
  const guild = await Options.findOne({
    where: {
      id: id
    }
  });

  if (!guild) {
    if (
      (flags === undefined || flags === defaultSettings.flags) &&
      (RNG === undefined || RNG === defaultSettings.RNG)
    )
      return { ...defaultSettings, id, default: true };
    else {
      await Options.create({
        id,
        flags: flags ?? defaultSettings.flags,
        RNG: RNG ?? defaultSettings.RNG
      });
      return {
        flags: flags ?? defaultSettings.flags,
        RNG: RNG ?? defaultSettings.RNG,
        id,
        default: false
      };
    }
  } else {
    if (
      (flags === undefined || flags === defaultSettings.flags) &&
      (RNG === undefined || RNG === defaultSettings.RNG)
    ) {
      await Options.destroy({
        where: {
          id
        }
      });
      return { ...defaultSettings, id, default: true };
    } else {
      await Options.update(
        {
          flags: flags ?? guild.flags,
          RNG: RNG ?? guild.RNG
        },
        {
          where: {
            id
          }
        }
      );
      return {
        flags: flags ?? guild.flags,
        RNG: RNG ?? guild.RNG,
        id,
        default: false
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

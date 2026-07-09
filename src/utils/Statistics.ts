import { Flags, numberToFlags, defaultSettings } from './Settings';

const simpleStats: {
    msgCount: number;
    responseCount: number;
    commandCount: number;
    barbecuesServed: number;
  } = {
    msgCount: 0,
    responseCount: 0,
    commandCount: 0,
    barbecuesServed: 0,
  },
  commandStats: Record<string, number> = {},
  responseStats: Record<Flags, number> = {} as Record<Flags, number>;

// Initialize responseStats with all flags set to 0
for (const flag of numberToFlags(defaultSettings.flags)) {
  responseStats[Flags[flag]] = 0;
}

export function incrementMsgCount() {
  return ++simpleStats.msgCount;
}

export function incrementResponseCount(flag: Flags) {
  ++responseStats[flag];
  return ++simpleStats.responseCount;
}

export function incrementBarbecuesServed() {
  return ++simpleStats.barbecuesServed;
}

export function initializeCommand(name: string) {
  if (commandStats[name] !== undefined) return;
  else commandStats[name] = 0;
  return commandStats[name];
}

export function incrementCommand(name: string) {
  if (commandStats[name] === undefined)
    throw new Error('Command has not been initialized');
  else commandStats[name]++;
  ++simpleStats.commandCount;
  return {
    command: commandStats[name],
    allCommands: simpleStats.commandCount,
  };
}

// Serializable data for cluster communication
export function getData() {
  return {
    msgCount: simpleStats.msgCount,
    responseCount: simpleStats.responseCount,
    commandCount: simpleStats.commandCount,
    barbecuesServed: simpleStats.barbecuesServed,
    commandStats,
    responseStats,
  };
}

export function getCommands() {
  let commands: { [key: string]: number } = {};
  Object.entries(commandStats).forEach((v) => {
    commands[v[0]] = v[1];
  });
  return commands;
}

export default {
  incrementCommand,
  incrementMsgCount,
  incrementResponseCount,
  incrementBarbecuesServed,
  initializeCommand,
  getData,
  getCommands,
};

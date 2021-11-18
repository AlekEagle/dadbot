const simpleStats: {
    msgCount: number;
    responseCount: number;
    commandCount: number;
    barbecuesServed: number;
  } = {
    msgCount: 0,
    responseCount: 0,
    commandCount: 0,
    barbecuesServed: 0
  },
  commandStats: Map<string, number> = new Map<string, number>();

export function incrementMsgCount() {
  return ++simpleStats.msgCount;
}

export function incrementResponseCount() {
  return ++simpleStats.responseCount;
}

export function incrementBarbecuesServed() {
  return ++simpleStats.barbecuesServed;
}

export function initializeCommand(name: string) {
  if (commandStats.has(name)) return;
  else commandStats.set(name, 0);
  return commandStats.get(name);
}

export function incrementCommand(name: string) {
  if (!commandStats.has(name))
    throw new Error('Command has not been initialized');
  else commandStats.set(name, commandStats.get(name) + 1);
  ++simpleStats.commandCount;
  return {
    command: commandStats.get(name),
    allCommands: simpleStats.commandCount
  };
}

export function getData() {
  return {
    msgCount: simpleStats.msgCount,
    responseCount: simpleStats.responseCount,
    commandCount: simpleStats.commandCount,
    barbecuesServed: simpleStats.barbecuesServed
  };
}

export function getCommands() {
  let commands: { [key: string]: number } = {};
  Array.from(commandStats.entries()).forEach(v => {
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
  getCommands
};

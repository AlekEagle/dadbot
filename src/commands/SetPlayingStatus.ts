import { CommandModule } from "../types";
import { isOwner } from "../utils/Owners";
import DadbotClusterClient from "../../../dadbot-cluster-client";

const GameTypes: { [key: string]: number } = {
  playing: 0,
  streaming: 1,
  listening: 2,
  watching: 3,
  custom: 4, // Can't be used for bots, but here for filling in the enum
  competing: 5,
};

function response(
  status: string,
  gameType?: number | null,
  gameStr?: string | null,
  url?: string | null
): string {
  if (!gameType && !gameStr) {
    return `I'm now simply **__${status}__**.`;
  } else {
    let gameTypeStr = "";
    switch (gameType) {
      case GameTypes.playing:
        gameTypeStr = "Playing";
        break;
      case GameTypes.streaming:
        gameTypeStr = "Streaming";
        break;
      case GameTypes.listening:
        gameTypeStr = "Listening to";
        break;
      case GameTypes.watching:
        gameTypeStr = "Watching";
        break;
      case GameTypes.custom:
        gameTypeStr = "Lol this doesn't work dumy";
        break;
      case GameTypes.competing:
        gameTypeStr = "Competing in";
        break;
      default:
        gameTypeStr = "How";
    }

    return `I'm now **__${status}__** and **__${gameTypeStr}__** **${gameStr}**${
      url ? ` at **${url}**` : ""
    }.`;
  }
}

const SetPlayingStatus: CommandModule = {
  name: "setplaying",

  async handler(client, msg, args) {
    if (!(await isOwner(msg.author.id))) {
      return "You do not have permission to use this command.";
    }

    let statusObj: {
      type?: number;
      name?: string;
      url?: string;
    } = {};

    if (args.length < 1) {
      return "You must at least provide a status (online, idle, dnd, invis/invisible/offline)";
    }

    let status = args[0].toLowerCase();
    if (status === "invis" || status === "invisible") {
      status = "offline";
    }

    if (args.length === 1) {
      await (
        (process as any).clusterClient as DadbotClusterClient<
          "ws",
          { url: "ws://localhost:8080/manager" }
        >
      ).startCCC("all", `client.editStatus('${status}', null)`);
      return response(status);
    }

    if (args.length === 2 && args[1].toLowerCase() === "preserve") {
      await (
        (process as any).clusterClient as DadbotClusterClient<
          "ws",
          { url: "ws://localhost:8080/manager" }
        >
      ).startCCC("all", `client.editStatus('${status}')`);
      return response(status);
    }

    statusObj.type = GameTypes[args[1].toLowerCase()];

    if (statusObj.type === undefined) {
      return "You must provide a valid game type (playing, streaming, listening, watching, custom, competing)";
    }

    statusObj.name =
      (args[1].toLowerCase() === "listening" &&
        args[2].toLowerCase() === "to") ||
      (args[1].toLowerCase() === "competing" &&
        args[2].toLowerCase() === "in") ||
      args[1].toLowerCase() === "streaming"
        ? args.slice(3).join(" ")
        : args.slice(2).join(" ");

    statusObj.url = args[1].toLowerCase() === "streaming" ? args[2] : undefined;

    if (statusObj.name.length === 0) {
      return "You must provide a game string";
    }

    await (
      (process as any).clusterClient as DadbotClusterClient<
        "ws",
        { url: "ws://localhost:8080/manager" }
      >
    ).startCCC(
      "all",
      `client.editStatus("${status}", ${JSON.stringify(statusObj)})`
    );

    return response(status, statusObj.type, statusObj.name, statusObj.url);
  },

  options: {
    hidden: true,
  },
};

export default SetPlayingStatus;

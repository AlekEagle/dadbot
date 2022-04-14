import fetch from "node-fetch";
import { CommandModule } from "../types";

const DevComputers: CommandModule = {
  name: "devcomputers",

  async handler(client, msg, args) {
    const res = await fetch("https://dumb-alek.alekeagle.com/clients", {
      method: "GET",
      headers: {
        Authorization: process.env.messWithAlekToken,
      },
    });
    const json = await res.json();

    return `These computers are currently connected: \`\`\`\n${json
      .map(
        (x: { username: string; computer: string }) =>
          `${x.username}'s computer named ${x.computer}`
      )
      .join("\n")}\n\`\`\``;
  },

  options: {
    description: "Get a list of all active computers.",
    fullDescription: "Get a list of all active computers.",
    usage: "",
  },
};

export default DevComputers;

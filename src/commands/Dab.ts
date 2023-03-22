import { SlashCommand } from "oceanic.js-interactions";
import Lists from "../utils/Lists";

const dab = new SlashCommand(
  "dab",
  "Dads dabbing!",
  {},
  {},
  async (_, interaction) => {
    interaction.createMessage({
      content:
        Lists.dadsDabbing[Math.floor(Math.random() * Lists.dadsDabbing.length)],
    });
  }
);

export default dab;

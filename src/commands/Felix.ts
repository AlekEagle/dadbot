import { SlashCommand } from "oceanic.js-interactions";
import Lists from "../utils/Lists";

const felix = new SlashCommand(
  "felix",
  "Just Felix.",
  {},
  {},
  async (_, interaction) => {
    interaction.createMessage({
      content: Lists.felix[Math.floor(Math.random() * Lists.felix.length)],
    });
  }
);

export default felix;

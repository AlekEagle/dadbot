import { SlashCommand } from "oceanic.js-interactions";
import Lists from "../utils/Lists";

const kumiko = new SlashCommand(
  "kumiko",
  "Just Kumiko.",
  {},
  {},
  async (_, interaction) => {
    interaction.createMessage({
      content: Lists.kumiko[Math.floor(Math.random() * Lists.kumiko.length)],
    });
  }
);

export default kumiko;

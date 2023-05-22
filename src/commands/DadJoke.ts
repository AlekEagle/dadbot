import { SlashCommand } from "oceanic.js-interactions";
import Lists from "../utils/Lists";

const dadjoke = new SlashCommand(
  "dadjoke",
  "Dad jokes.",
  {},
  {},
  async (interaction) => {
    interaction.createMessage({
      content: Lists.jokes[Math.floor(Math.random() * Lists.jokes.length)],
    });
  }
);

export default dadjoke;

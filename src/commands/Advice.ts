import { SlashCommand } from "oceanic.js-interactions";
import Lists from "../utils/Lists";

const advice = new SlashCommand(
  "advice",
  "Get some advice.",
  {},
  {},
  async (interaction) => {
    interaction.createMessage({
      content: Lists.advice[Math.floor(Math.random() * Lists.advice.length)],
    });
  }
);

export default advice;

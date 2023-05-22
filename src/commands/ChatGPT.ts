import { SlashCommand, OptionBuilder } from "oceanic.js-interactions";

const chatGPT = new SlashCommand(
  "chatgpt",
  "Chat with Dad Bot using GPT-3!",
  {},
  {
    prompt: OptionBuilder.String("The prompt for GPT-3 to use", true),
  },
  async (interaction) => {
    // Acknowledge the interaction so the user knows the bot is working and ChatGPT is thinking.
    await interaction.defer();
    // Wait anywhere from 1 to 5 seconds to simulate thinking.
    await new Promise((resolve) =>
      setTimeout(resolve, Math.random() * 4000 + 1000)
    );
    // Respond with "ChatGPT is at capacity, please try again later."
    await interaction.createFollowup({
      content: "ChatGPT is at capacity, please try again later.",
    });
  }
);

export default chatGPT;

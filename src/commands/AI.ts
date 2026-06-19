import { SlashCommand, OptionBuilder } from 'oceanic.js-interactions';
import Lists from '../utils/Lists';

const ai = new SlashCommand(
  'ai',
  'Chat with DadAI! (DadAI is very real and totally not fake.)',
  {},
  {
    prompt: OptionBuilder.String('The prompt for DadAI to use', true),
  },
  async (interaction) => {
    // Choose a random response from the ai list in Lists.
    const response = Lists.ai[Math.floor(Math.random() * Lists.ai.length)];
    // Acknowledge the interaction so the user knows the bot is working and DadAI is thinking.
    await interaction.defer();
    // Wait an amount of time that depends on the length of the response, to simulate thinking.
    await new Promise((resolve) =>
      setTimeout(
        resolve,
        response.length * 100 + Math.floor(Math.random() * 2000),
      ),
    );
    // Respond with the chosen response.
    await interaction.createFollowup({
      // The content of the response should be the chosen response.
      content: response, // This is the response that was chosen from the ai list in Lists.
    });
  },
);

export default ai;

import { SlashCommand } from 'oceanic.js-interactions';

const fuwi = new SlashCommand('fuwi', 'Fuwi', {}, {}, async (interaction) => {
  interaction.createMessage({
    content: 'https://cdn.alekeagle.me/r5e7q7C4ny.png',
  });
});

export default fuwi;

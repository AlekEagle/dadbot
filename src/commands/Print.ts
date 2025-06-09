import { OptionBuilder, SlashCommand } from 'oceanic.js-interactions';
import fetch from 'node-fetch';
import { MessageFlags } from 'oceanic.js';

const localRateLimitedUsers = new Map<string, number>();
const localRateLimitedChannels = new Map<string, number>();

// Reap rate limit every now and then to save on RAM.
setInterval(() => {
  const now = Date.now();

  localRateLimitedChannels.forEach((time, channel) => {
    if (time < now) localRateLimitedChannels.delete(channel);
  })

  localRateLimitedUsers.forEach((time, user) => {
    if (time < now) localRateLimitedUsers.delete(user);
  })
}, 1000 * 60 * 60);

const print = new SlashCommand(
  'print',
  'Print something on my printer named Steve.',
  {},
  {
    file: OptionBuilder.Attachment('The image to print. Must be a PNG or a JPEG.', true)
  },
  async (interaction, { file }) => {
    const now = Date.now();

    const userRate = localRateLimitedUsers.get(interaction.user.id) ?? 0;
    const channelRate = localRateLimitedChannels.get(interaction.channelID) ?? 0;
    if (userRate >= now) {
      await interaction.createMessage({
        flags: MessageFlags.EPHEMERAL,
        content: 'You are trying to use the printer too much! Learn how to share!'
      });
      return;
    } else if (channelRate >= now) {
      await interaction.createMessage({
        content: 'This channel is using the printer too fast! Learn how to share!'
      });
      return;
    }

    localRateLimitedUsers.set(interaction.user.id, now + (1000 * 60));
    localRateLimitedChannels.set(interaction.channelID, now + (1000 * 60));

    await interaction.defer();
    const response = await fetch('https://printer.alekeagle.com/print', {
      method: 'POST',
      headers: {
        'Content-Type': file.contentType,
        'Authorization': process.env.PRINTER_TOKEN
      }
    });

    if (response.ok) {
      await interaction.createFollowup({
        content: 'Printed! If you want to see me react to it (if I ever post about it) you can see in the support server! discord.gg/alek-s-cult-456542159210807307'
      });
    } else {
      await interaction.createFollowup({
        content: 'Uh, I think the printer ran out of ink. Try again tomorrow?'
      });
    }
  },
);

export default print;

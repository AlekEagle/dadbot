import {
  Webhook,
  Client,
  AnyTextableChannel,
  PrivateChannel,
  AnnouncementThreadChannel,
  ThreadChannel,
} from 'oceanic.js';
import { client } from '../index';

const webhookName = 'Dad Bot Webhook™';

export default class Dadhook extends Webhook {
  public static async getAvatar(client: Client) {
    return `data:image/png;base64,${Buffer.from(
      await (await fetch(client.user.avatarURL('png', 1024))).arrayBuffer(),
    ).toString('base64')}`;
  }

  public static promoteToDadhook(dumb: Webhook): Dadhook {
    const cool = Object.create(
      Dadhook.prototype,
      Object.getOwnPropertyDescriptors(dumb),
    );

    return cool;
  }

  public static async giveMeDadhook(
    channel: Exclude<AnyTextableChannel, PrivateChannel>,
  ) {
    // Screw checking for permissions, we're just going to try/catch missing permission errors
    let webhook: Webhook | undefined;

    try {
      let webhooks = await channel.guild.getWebhooks();
      webhook = webhooks.find(
        (w) => w.name === webhookName && w.applicationID == client.user.id,
      );
    } catch (_) {
      throw new Error(
        'The bot does not have the "Manage Webhooks" permission for this guild.',
      );
    }

    const target: Exclude<AnyTextableChannel, PrivateChannel | ThreadChannel> =
      channel instanceof ThreadChannel
        ? await client.rest.channels.get(channel.parentID)
        : channel;
    if (webhook) {
      try {
        if (webhook.channelID !== target.id)
          await webhook.edit({ channelID: target.id });
        return Dadhook.promoteToDadhook(webhook);
      } catch (_) {
        throw new Error(
          'The bot does not have the permissions to move the webhook.',
        );
      }
    } else {
      try {
        return Dadhook.promoteToDadhook(
          await target.createWebhook({
            name: webhookName,
            avatar: await Dadhook.getAvatar(channel.client),
          }),
        );
      } catch (_) {
        throw new Error(
          'The bot does not have permissions to create a new webhook.',
        );
      }
    }
  }
}

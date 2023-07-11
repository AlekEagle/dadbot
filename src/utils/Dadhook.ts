import {
  Webhook,
  Client,
  AnyTextableChannel,
  PrivateChannel,
  AnnouncementThreadChannel,
  ThreadChannel,
} from "oceanic.js";

import fetch from "node-fetch";

const webhookName = "Dad Bot Webhook™";

export default class Dadhook extends Webhook {
  public static async getAvatar(client: Client) {
    return `data:image/png;base64,${(
      await (await fetch(client.user.avatarURL())).buffer()
    ).toString("base64")}`;
  }

  public static promoteToDadhook(dumb: Webhook): Dadhook {
    const cool = Object.create(
      Dadhook.prototype,
      Object.getOwnPropertyDescriptors(dumb)
    );

    return cool;
  }

  public static async giveMeDadhook(
    channel: Exclude<
      AnyTextableChannel,
      PrivateChannel | AnnouncementThreadChannel | ThreadChannel
    >
  ) {
    // Screw checking for permissions, we're just going to try/catch missing permission errors
    let webhook: Webhook;

    try {
      let webhooks = await channel.guild.getWebhooks();
      webhook = webhooks.find((w) => w.name === webhookName);
    } catch (_) {
      throw new Error(
        'The bot does not have the "Manage Webhooks" permission for this guild.'
      );
    }

    if (webhook) {
      try {
        if (webhook.channelID !== channel.id)
          await webhook.edit({ channelID: channel.id });
        return Dadhook.promoteToDadhook(webhook);
      } catch (_) {
        throw new Error(
          'The bot does not have the permissions to move the webhook.'
        );
      }
    } else {
      try {
        return Dadhook.promoteToDadhook(
          await channel.createWebhook({
            name: webhookName,
            avatar: await Dadhook.getAvatar(channel.client),
          })
        );
      } catch (_) {
        throw new Error(
          'The bot does not have permissions to create a new webhook.'
        );
      }
    }
  }
}

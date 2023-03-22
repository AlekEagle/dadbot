import {
  TextableChannel,
  Webhook,
  Client,
  AnyTextChannelWithoutGroup,
  PrivateChannel,
  AnnouncementThreadChannel,
  PublicThreadChannel,
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
      AnyTextChannelWithoutGroup,
      PrivateChannel | AnnouncementThreadChannel | ThreadChannel
    >
  ) {
    // Check if the bot has webhook permission for the guild
    if (
      !channel.guild
        .permissionsOf(channel.client.user.id)
        .has("MANAGE_WEBHOOKS")
    )
      throw new Error(
        'The bot does not have the "Manage Webhooks" permission for this guild.'
      );
    const webhooks = await channel.guild.getWebhooks(),
      webhook = webhooks.find((w) => w.name === webhookName);

    if (webhook) {
      await webhook.edit({ channelID: channel.id });
      return Dadhook.promoteToDadhook(webhook);
    } else {
      return Dadhook.promoteToDadhook(
        await channel.createWebhook({
          name: webhookName,
          avatar: await Dadhook.getAvatar(channel.client),
        })
      );
    }
  }
}

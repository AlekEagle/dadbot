import Eris, { GuildTextableChannel } from "eris";
import ECH from "eris-command-handler";
import fetch from "node-fetch";

const webhookName = "Dad Bot Webhook™";

export default class Dadhook {
  public avatar?: string;
  public channel_id: string;
  public guild_id: string;
  public id: string;
  public name: string;
  public token: string;
  public user: Eris.PartialUser;
  public static async getGuildDadhook(guild: Eris.Guild): Promise<Dadhook> {
    let dadhook = (await guild.getWebhooks()).find(
      (w) => w.name === webhookName
    );
    if (!dadhook) {
      let avatar = `data:image/png;base64,${(
        await (
          await fetch((guild as any)._client.user.dynamicAvatarURL("png", 2048))
        ).buffer()
      ).toString("base64")}`;
      let validChannel = guild.channels.filter(
        (c) =>
          c.type === Eris.Constants.ChannelTypes.GUILD_TEXT &&
          c
            .permissionsOf((guild as any)._client.user.id)
            .has("manageWebhooks") &&
          c.permissionsOf((guild as any)._client.user.id).has("readMessages")
      )[0] as GuildTextableChannel;

      let newWebhook = await validChannel.createWebhook({
        name: webhookName,
        avatar,
      });
      return new Dadhook(newWebhook, (guild as any)._client);
    }
    return new Dadhook(dadhook, (guild as any)._client);
  }
  private client: ECH.CommandClient;
  constructor(webhookObj: Eris.Webhook, client: ECH.CommandClient) {
    Object.assign(this, webhookObj);
    this.client = client;
  }

  public async changeChannel(
    channel: Eris.GuildTextableChannel
  ): Promise<Dadhook> {
    let permsOfBot = channel.permissionsOf(this.client.user.id),
      currentChannelPerms = this.client.guilds
        .get(this.guild_id)
        .channels.get(this.channel_id)
        .permissionsOf(this.client.user.id),
      destinationChannelPerms = this.client.guilds
        .get(this.guild_id)
        .channels.get(channel.id)
        .permissionsOf(this.client.user.id);

    let res;
    if (
      permsOfBot.has("manageWebhooks") &&
      currentChannelPerms.has("manageWebhooks") &&
      destinationChannelPerms.has("manageWebhooks")
    ) {
      try {
        res = await this.client.editWebhook(this.id, { channelID: channel.id });
      } catch (err) {
        throw err;
      }
    } else {
      throw new Error(`Missing manage webhook permissions somewhere.`);
    }
    Object.assign(this, res);
    return this;
  }

  async edit(options: any, reason: string): Promise<Dadhook> {
    let res;
    try {
      res = await this.client.editWebhook(this.id, options, this.token, reason);
    } catch (err) {
      throw err;
    }
    Object.assign(this, res);
    return this;
  }

  async delete(reason: string): Promise<void> {
    try {
      await this.client.deleteWebhook(this.id, this.token, reason);
    } catch (err) {
      throw err;
    }
    return;
  }

  async send(stuff: Eris.WebhookPayload) {
    await this.client.executeWebhook(this.id, this.token, stuff);
  }
}

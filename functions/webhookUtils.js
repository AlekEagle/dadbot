'use strict';

const Eris = require('eris'),
  fetch = require('node-fetch');

// the module responsible for handling webhooks for embarrass and etc.

const webhookName = 'Dad Bot Webhook™';

class ServerWebhook {
  constructor(webhookObj, client) {
    Object.assign(this, webhookObj);
    this.__client = client;
  }

  async changeChannel(channelID) {
    if (this.channel_id === channelID) return this;
    if (!this.__client.guilds.get(this.guild_id).channels.has(channelID)) {
      throw new Error("Channel doesn't exist in the guild the webhook is in.");
    }
    if (
      !this.__client.guilds
        .get(this.guild_id)
        .channels.get(this.channel_id)
        .permissionsOf(this.__client.user.id)
        .has('manageWebhooks') ||
      !this.__client.guilds
        .get(this.guild_id)
        .channels.get(channelID)
        .permissionsOf(this.__client.user.id)
        .has('manageWebhooks')
    ) {
      throw new Error(
        "Bot doesn't have permission to edit webhooks in originating channel or destination channel."
      );
    }
    try {
      let res = await this.__client.editWebhook(this.id, { channelID });
      Object.assign(this, res);
      return this;
    } catch (error) {
      throw error;
    }
  }

  async edit(options, reason) {
    try {
      let res = await this.__client.editWebhook(
        this.id,
        options,
        this.token,
        reason
      );
      Object.assign(this, res);
      return this;
    } catch (error) {
      throw error;
    }
  }

  async delete(reason) {
    try {
      return await this.__client.deleteWebhook(this.id, this.token, reason);
    } catch (error) {
      throw error;
    }
  }

  async send(options) {
    try {
      await this.__client.executeWebhook(this.id, this.token, options);
      return this;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = {
  ServerWebhook,

  async getGuildDadhook(guild) {
    let webhooks = await guild.getWebhooks();
    if (!webhooks.find(w => w.name === webhookName)) {
      let channel = guild.channels.filter(
          c =>
            c.type === Eris.Constants.ChannelTypes.GUILD_TEXT &&
            c.permissionsOf(client.user.id).has('manageWebhooks')
        )[0],
        avatar =
          'data:image/png;base64,' +
          (
            await (
              await fetch(guild._client.user.dynamicAvatarURL('png', 2048))
            ).buffer()
          ).toString('base64'),
        webhook = await channel.createWebhook({
          name: webhookName,
          avatar
        });

      return new ServerWebhook(webhook, guild._client);
    } else {
      return new ServerWebhook(
        webhooks.find(w => w.name === webhookName),
        guild._client
      );
    }
  }
};

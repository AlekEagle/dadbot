'use strict';

let DBL = require('@top-gg/sdk');
const api = new DBL.Api(process.env.dblToken)
module.exports = {
  name: 'guildCreate',

  exec: (client, guild) => {
    var bots = guild.members.filter(m => m.bot).length;
    var notBots = guild.memberCount - bots;
    var percent = Math.floor((bots / guild.memberCount) * 100);
    client.executeWebhook('547588483502440464', process.env.webhookTokenThing, {
      embeds: [
        {
          title: 'Server Create Alert',
          thumbnail: {
            url: guild.dynamicIconURL(
              guild.icon
                ? guild.icon.startsWith('a_')
                  ? 'gif'
                  : 'png'
                : 'png',
              256
            )
          },
          author: {
            name: `${client.users.get(guild.ownerID)
              ? client.users.get(guild.ownerID).username
              : 'Not Cached'
              }#${client.users.get(guild.ownerID)
                ? client.users.get(guild.ownerID).discriminator
                : '0000'
              }`,
            icon_url: client.users.get(guild.ownerID)
              ? client.users
                .get(guild.ownerID)
                .dynamicAvatarURL(
                  client.users.get(guild.ownerID).avatar
                    ? client.users.get(guild.ownerID).avatar.startsWith('a_')
                      ? 'gif'
                      : 'png'
                    : 'png',
                  256
                )
              : client.user.defaultAvatarURL,
            url: client.users.get(guild.ownerID)
              ? client.users
                .get(guild.ownerID)
                .dynamicAvatarURL(
                  client.users.get(guild.ownerID).avatar
                    ? client.users.get(guild.ownerID).avatar.startsWith('a_')
                      ? 'gif'
                      : 'png'
                    : 'png',
                  256
                )
              : client.user.defaultAvatarURL
          },
          fields: [
            {
              name: 'Guild Name',
              value: guild.name,
              inline: true
            },
            {
              name: 'Guild ID',
              value: guild.id,
              inline: true
            },
            {
              name: 'Member Count',
              value: guild.memberCount,
              inline: true
            },
            {
              name: 'User to Bot Ratio',
              value: `${notBots}:${bots}`,
              inline: true
            },
            {
              name: 'Bot Percentage',
              value: `${percent}%`,
              inline: true
            },
            {
              name: 'Shard',
              value: guild.shard.id,
              inline: true
            },
            {
              name: 'New Guild Count',
              value: client.guilds.size,
              inline: true
            }
          ],
          footer: {
            url: client.user.dynamicAvatarURL('png', 512).split('?')[0],
            text: `${client.user.username}#${client.user.discriminator}`
          }
        }
      ]
    });
    setInterval(() => {
      api.postStats({
        serverCount: client.guilds.filter(g => g.shard.id === guild.shard.id).length,
        shardCount: Number(process.env.totalShards)
      })

    }, 2100000);
  }
};

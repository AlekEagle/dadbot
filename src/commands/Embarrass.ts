import Eris from 'eris';
import { client } from '..';
import Dadhook from '../utils/Dadhook';
import Lists from '../utils/Lists';

const Embarrass: CommandModule = {
  name: 'embarrass',

  async handler(msg: Eris.Message<Eris.GuildTextableChannel>, args) {
    if (!msg.channel.permissionsOf(client.user.id).has('manageWebhooks'))
      return 'No can do bub, in order for me to embarrass people I need the permission `MANAGE_WEBHOOKS`.';
    let random = Math.floor(Math.random() * Lists.embarrassingThings.length),
      user = msg.member;
    if (msg.mentions[0])
      user = msg.channel.guild.members.get(msg.mentions[0].id);
    if (random > 1) {
      let dadhook = await Dadhook.getGuildDadhook(msg.channel.guild);
      if (dadhook.channel_id !== msg.channel.id)
        await dadhook.changeChannel(msg.channel);
      await dadhook.send({
        content: Lists.embarrassingThings[random],
        avatarURL: user.user.dynamicAvatarURL('png', 4096),
        username: user.nick && user.nick.length > 1 ? user.nick : user.username
      });
    } else {
      msg.channel.createMessage({
        content: Lists.embarrassingThings[random],
        messageReference: {
          messageID: msg.id,
          channelID: msg.channel.id,
          guildID: msg.channel.guild.id
        },
        allowedMentions: { repliedUser: true }
      });
    }
  },

  options: {
    guildOnly: true,
    description: 'Embarrass yourself or friends!',
    usage: '[@user]',
    cooldown: 10000,
    cooldownMessage:
      "It's really hard doing impressions, give me a little bit, okay?"
  }
};

export default Embarrass;

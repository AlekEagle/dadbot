import GBlacklist from './DB/GlobalBlacklist';
import { Message, TextableChannel, GuildTextableChannel } from 'eris';

export interface BlacklistData {
  type: 0 | 1 | 2;
  commands: string[];
}

export async function getValueByID(id: string) {
  let res = await GBlacklist.findOne({
    where: {
      id
    }
  });
  return res;
}

export async function setValueByID(id: string, cmds: string[]) {
  try {
    let res = await GBlacklist.findOne({
      where: {
        id
      }
    });

    if (!res) {
      if (cmds.length < 1) {
        return null;
      } else {
        await GBlacklist.create({ id, cmds });
        return { id, cmds };
      }
    } else {
      if (cmds.length < 1) {
        await res.destroy();
        return null;
      } else {
        await res.update({ cmds });
        return { id, cmds };
      }
    }
  } catch (err) {
    throw err;
  }
}

export async function checkBlacklistStatus(
  msg: Message<TextableChannel>
): Promise<null | BlacklistData> {
  let usr = msg.author.id,
    channel = msg.channel.id,
    guild = (msg.channel as GuildTextableChannel).guild
      ? (msg.channel as GuildTextableChannel).guild.id
      : null;

  let usrBL = await getValueByID(usr),
    channelBL = await getValueByID(channel),
    guildBL = null;

  if (guild !== null) {
    guildBL = await getValueByID(guild);
  }

  if (usrBL === null && channelBL === null && guildBL === null) {
    return null;
  }

  if (usrBL) {
    return { type: 0, commands: usrBL.cmds };
  } else if (channelBL) {
    return { type: 1, commands: channelBL.cmds };
  } else if (guildBL && guild !== null) {
    // Sanity check because yes
    return { type: 2, commands: guildBL.cmds };
  }
  throw new Error(
    "Not sure how we got here, we should've returned somewhere before this."
  );
}

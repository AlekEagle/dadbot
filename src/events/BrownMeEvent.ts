import { Message } from 'oceanic.js';
import { isBrownMeEnabled } from '../utils/BrownMe';

export default async function BrownMeEvent(msg: Message) {
  if (!msg.guildID) return;
  const brownMeStatus = await isBrownMeEnabled(msg.guildID);
  if (!brownMeStatus.enabled) return;
  const member = msg.member;
  if (!member) return;
  if (member.roles.includes(brownMeStatus.roleID!)) return;
  if (msg.mentions.roles.includes(brownMeStatus.roleID!)) {
    try {
      await msg.client.rest.guilds.addMemberRole(
        msg.guildID,
        member.user.id,
        brownMeStatus.roleID!,
      );
    } catch (error) {
      console.error('Error adding Brown Me role:', error);
    }
  }
}

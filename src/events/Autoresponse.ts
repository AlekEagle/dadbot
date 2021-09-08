import { checkBlacklistStatus } from '../utils/Blacklist';
import { EventModule } from '../types';
import ECH from 'eris-command-handler';
import { Message } from 'eris';

const imMatch = /\b((?:i|l)(?:(?:'|`|‛|‘|’|′|‵)?m|\bam))\b([\s\S]*)/i,
  kysMatch = /\b(kys|kill\byour\s?self)\b/i,
  formattingMatch = /(\*\*?\*?|``?`?|__?|~~|\|\|)+/gi;

const __event: EventModule = {
  name: 'messageCreate',

  handler: async (client: ECH.CommandClient, msg: Message) => {
    if (msg.author.bot) return;

    if (msg.content.match(imMatch)) {
      console.log('lol');
    }
  }
};

export default __event;

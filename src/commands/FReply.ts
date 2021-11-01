import { CommandModule } from '../types';
import { isOwner } from '../utils/Owners';
import Suggestions from '../utils/Suggestions';

const FReply: CommandModule = {
  name: 'freply',

  async handler(client, msg, args) {
    if (!(await Suggestions.get(args[0])))
      return "That suggestion doesn't exist!";
    if (!(await isOwner(msg.author.id)))
      return "You don't have the permission to reply to suggestions!";
    Suggestions.reply(args.shift(), msg, args.join(' '));
  },

  options: {
    usage: '<FeedbackID> {your response}',
    description: 'respond to pieces of feedback!',
    hidden: true
  }
};

export default FReply;

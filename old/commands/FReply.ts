import { isOwner } from "../../src/utils/Owners";
import Suggestions from "../utils/Suggestions";

const FReply: CommandModule = {
  name: "freply",

  async handler(msg, args) {
    if (!(await isOwner(msg.author.id)))
      return "You don't have the permission to reply to suggestions!";
    if (!(await Suggestions.get(args[0])))
      return "That suggestion doesn't exist!";
    await Suggestions.reply(args.shift(), msg, args.join(" "));
    return "Done!";
  },

  options: {
    usage: "<FeedbackID> {your response}",
    description: "respond to pieces of feedback!",
    hidden: true,
  },
};

export default FReply;

import { client } from "..";
import { isOwner } from "../../src/utils/Owners";
import Suggestions from "../utils/Suggestions";

const FDelete: CommandModule = {
  name: "fdelete",

  async handler(msg, args) {
    let suggestion = await Suggestions.get(args[0]);
    if (suggestion === null) return "That suggestion doesn't exist!";
    if (suggestion.userID !== msg.author.id) {
      if (!(await isOwner(msg.author.id)))
        return "You don't have the permission to delete that suggestion!";
      else {
        await Suggestions.delete(args[0], client);
        return "Done!";
      }
    } else {
      await Suggestions.delete(args[0], client);
      return "Done!";
    }
  },

  options: {
    usage: "<FeedbackID>",
    description: "Delete your own pieces of feedback!",
  },
};

export default FDelete;

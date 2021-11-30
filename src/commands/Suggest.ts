import { CommandModule } from '../types';
import Suggestions from '../utils/Suggestions';
import { analyzeComment, Attributes } from '../utils/Perspective';

const Suggest: CommandModule = {
  name: 'suggest',

  async handler(client, msg, args) {
    if (args.length < 3)
      return `A suggestion ${args.length} word${
        args.length !== 1 ? 's' : ''
      } isn't very helpful. Do better.`;

    let perspectiveRes;
    try {
      perspectiveRes = await analyzeComment(args.join(' '), [
        { name: Attributes.SPAM },
        { name: Attributes.UNSUBSTANTIAL }
      ]);
    } catch (err) {
      throw err;
    }

    if (
      perspectiveRes.attributeScores.SPAM.summaryScore.value > 0.625 ||
      perspectiveRes.attributeScores.UNSUBSTANTIAL.summaryScore.value > 0.625
    )
      return "This doesn't even look like anything that would help us with improving Dad Bot, come back when you can actually suggest helpful stuff.";

    let suggestion;
    try {
      suggestion = await Suggestions.create('suggestion', msg, args.join(' '));
    } catch (err) {
      console.log(err);
      throw err;
    }

    return `The Dad Bot Crew has been notified. For reference, your suggestion ID is: \`${suggestion.id}\`. If a crew member happens to reply to your suggestion, I'll reply to your message with what they said as well as pinging you!`;
  },

  options: {
    description:
      "Suggest something to the Dad Bot crew! We use Google's Perspective API to determine if its truly a suggestion or not, if you don't want Google to see it, come to the support server and say it there. Please limit suggestions to actual suggestions, if you fail to do so you may be restricted from sending more.",
    cooldown: 60000,
    cooldownMessage:
      'Hold your horses, as much as we love to hear from you, give us time to read it and maybe even respond!',
    usage: '{your suggestion here}'
  }
};

export default Suggest;

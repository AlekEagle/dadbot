import Suggestions from '../utils/Suggestions';
import { analyzeComment, Attributes } from '../utils/Perspective';

const Compliment: CommandModule = {
  name: 'compliment',

  async handler(msg, args) {
    if (args.length < 3)
      return `A compliment ${args.length} word${
        args.length !== 1 ? 's' : ''
      } isn't very helpful. Do better.`;

    let perspectiveRes;
    try {
      perspectiveRes = await analyzeComment(args.join(' '), [
        { name: Attributes.TOXICITY }
      ]);
    } catch (err) {
      throw err;
    }

    if (perspectiveRes.attributeScores.TOXICITY.summaryScore.value > 0.625)
      return "Nice try, did you think I was going to let that slip past me? I'm disappointed. Come back when you actually can say something nice.";

    let suggestion;
    try {
      suggestion = await Suggestions.create('compliment', msg, args.join(' '));
    } catch (err) {
      console.log(err);
      throw err;
    }

    return `The Dad Bot Crew has been notified. For reference, your compliment ID is: \`${suggestion.id}\`. If a crew member happens to reply to your compliment, I'll reply to your message with what they said as well as pinging you!`;
  },

  options: {
    description:
      "Compliment anything and send it to the Dad Bot crew! We don't care if its a joke or if its a genuine compliment, we read all of them! We use Google's Perspective API to determine if its truly a compliment or not, if you don't want Google to see it, come to the support server and say it there.",
    cooldown: 60000,
    cooldownMessage:
      'Hold your horses, as much as we love to hear from you, give us time to read it and maybe even respond!',
    usage: '{your funny compliment}'
  }
};

export default Compliment;

import Suggestions from '../utils/Suggestions';

const Complain: CommandModule = {
  name: 'complain',

  async handler(msg, args) {
    if (args.length < 3)
      return `A complaint ${args.length} word${
        args.length !== 1 ? 's' : ''
      } isn't very helpful. Do better.`;
    let suggestion;
    try {
      suggestion = await Suggestions.create('complaint', msg, args.join(' '));
    } catch (err) {
      console.log(err);
      throw err;
    }

    return `The Dad Bot Crew has been notified. For reference, your complaint ID is: \`${suggestion.id}\`. If a crew member happens to reply to your complaint, I'll reply to your message with what they said as well as pinging you!`;
  },

  options: {
    description:
      "Complain about anything to the dad bot crew! We don't care if its a joke or if its a genuine concern, we read all of them!",
    cooldown: 60000,
    cooldownMessage:
      'Hold your horses, as much as we love to hear from you, give us time to read it and maybe even respond!',
    usage: '{your funny complaint}'
  }
};

export default Complain;

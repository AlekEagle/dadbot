'use strict';

module.exports = {
  name: 'gamesrob',

  exec: (client, msg, args) => {
    msg.channel.createMessage(
      'GamesROB is one of the few discord bots to have the ability to play uno on discord! You can play Hangman, Minesweeper, Connect 4, and many more games like this! Go check them out at https://discordbots.org/bot/gamesrob'
    );
  },

  options: {
    description: `One of our partners!`,
    fullDescription: `GamesROB is one of Dad Bots partners!`
  }
};

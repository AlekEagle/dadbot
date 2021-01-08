'use strict';
module.exports = {
  name: 'cmdstats',

  exec: (client, msg, args) => {
    let i = 0,
      data = [];
    function getData() {
      return new Promise((resolve, reject) => {
        grafana
          .remoteEval(
            i,
            "let stats = require('./functions/commandStatistics');JSON.stringify(stats.uses.toJSON());"
          )
          .then(res => {
            let stuff = JSON.parse(res);
            for (let ii = 0; ii < stuff.length; ii++) {
              if (data.find(e => e[0] === stuff[ii][0])) {
                data[data.indexOf(data.find(e => e[0] === stuff[ii][0]))][1] +=
                  stuff[ii][1];
              } else {
                data.push(stuff[ii]);
              }
            }
            if (++i < Number(process.env.instances)) getData().then(resolve);
            else resolve();
          }, reject);
      });
    }
    getData().then(() => {
      var entries = data.sort((a, b) => a[1] - b[1]).reverse();
      if (args[0] === undefined) args[0] = 0;
      else args[0] = parseInt(args[0]);
      if (args[0] === NaN) args[0] = 0;
      else if (args[0] !== 0) args[0]--;
      if (args[0] + 1 > Math.ceil(entries.length / 10))
        return `That's more pages then there are pages of commands! The last page is ${Math.ceil(
          entries.length / 10
        )}!`;
      msg.channel.createMessage(
        `This is page ${args[0] + 1} of ${Math.ceil(
          entries.length / 10
        )}\n\`\`\`${entries
          .slice(0 + 10 * args[0], 10 + 10 * args[0])
          .map(e => `${entries.indexOf(e) + 1}. ${e[0]}: ${e[1]} uses`)
          .join('\n')}\`\`\``
      );
    });
  },

  options: {
    description: 'Which command is the most used command?',
    fullDescription: 'Shows each commands stats',
    usage: '[page#]'
  }
};

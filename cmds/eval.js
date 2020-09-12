"use strict";

let owners = require("../functions/getOwners");
let util = require("util");

module.exports = {
  name: "eval",

  exec: (client, msg, args) => {
    if (owners.isAdmin(msg.author.id)) {
      try {
        var evalCommand = args.join(" ");
        let evaluation = eval(evalCommand);
        if (typeof evaluation !== "string") {
          evaluation = util
            .inspect(evaluation)
            .replace(client.token, "(insert token here)");
        } else {
          evaluation = evaluation.replace(client.token, "(insert token here)");
        }
        if (evaluation.length > 2000) {
          if (evaluation.length > 8388608) {
            client.createMessage(
              msg.channel.id,
              "Output too large, even for a file! you're on your own this time!"
            );
            return;
          }
          client.createMessage(
            msg.channel.id,
            "Output too large, heres a file instead!",
            { file: Buffer.from(evaluation), name: "output.txt" }
          );
        } else {
          client.createMessage(msg.channel.id, evaluation);
        }
      } catch (err) {
        client.createMessage(
          msg.channel.id,
          "OOF ERROR:\ninput: ```" +
            evalCommand +
            "``` output: ```" +
            err +
            "```"
        );
      }
    } else
      client.createMessage(
        msg.channel.id,
        "You need the permission `BOT_ADMIN_OWNER` to use this command!"
      );
  },

  options: {
    hidden: true,
    fullDescription: "Evaluates code with a command (owner only)",
    aliases: ["evaluate", "ev"],
    removeWhitespace: false,
  },
};

"use strict";

const Perspective = require("perspective-api-client");
const perspective = new Perspective({ apiKey: process.env.perspectiveKey });

module.exports = {
  name: "compliment",

  exec: (client, msg, args) => {
    if (args.length <= 2) {
      msg.channel.createMessage(
        `a compliment ${args.length} word${
          args.length === 1 ? "" : "s"
        } long isn't very helpful.`
      );
    } else {
      perspective.analyze(args.join(" ")).then((output) => {
        if (output.attributeScores.TOXICITY.summaryScore.value > 0.625) {
          msg.channel.createMessage(
            "Probably the worst attempt at trying to pass something mean as a compliment."
          );
        } else {
          client
            .createMessage("690286380122767481", {
              embed: {
                title: "New Compliment",
                author: {
                  name: `${msg.author.username}#${msg.author.discriminator} (${msg.author.id})`,
                  icon_url: msg.author
                    .dynamicAvatarURL("png", 512)
                    .split("?")[0],
                },
                description: args.join(" "),
                fields: [
                  {
                    name: "Shard",
                    value: client.options.firstShardID,
                    inline: true,
                  },
                  {
                    name: "User",
                    value: `${msg.author.username}#${msg.author.discriminator} \`<${msg.author.id}>\``,
                    inline: true,
                  },
                  {
                    name: "Guild",
                    value: msg.channel.guild
                      ? `\`${msg.channel.guild.name} <${msg.channel.guild.id}>\``
                      : "`Private Message <N/A>`",
                    inline: true,
                  },
                  {
                    name: "Channel",
                    value: msg.channel.guild
                      ? `\`${msg.channel.name} <${msg.channel.id}>\``
                      : `\`Private Message <${msg.channel.id}>\``,
                    inline: true,
                  },
                  {
                    name: "Time",
                    value: new Date(msg.timestamp).toUTCString(),
                    inline: true,
                  },
                ],
              },
            })
            .then(
              (message) => {
                msg.channel.createMessage(
                  "The Dad Bot crew has been notified."
                );
              },
              () => {
                msg.channel.createMessage(
                  "That didn't work for some reason, try again later."
                );
              }
            );
        }
      });
    }
  },

  options: {
    description: "compliment the creator about things",
    fullDescription:
      "compliment the creator about things in dad bot! Gets sent to the discord server!",
  },
};

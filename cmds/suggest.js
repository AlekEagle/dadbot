"use strict";

const Perspective = require("perspective-api-client");
const perspective = new Perspective({ apiKey: process.env.perspectiveKey });

module.exports = {
  name: "suggest",

  exec: (client, msg, args) => {
    if (args.length <= 2) {
      msg.channel.createMessage(
        `a suggestion ${args.length} word${
          args.length === 1 ? "" : "s"
        } long isn't very helpful.`
      );
    } else {
      perspective
        .analyze(args.join(" "), { attributes: ["spam"] })
        .then((output) => {
          if (output.attributeScores.SPAM.summaryScore.value > 0.625) {
            msg.channel.createMessage(
              "This doesn't look like an actual suggestion."
            );
          } else {
            client
              .createMessage("690299278702149712", {
                embed: {
                  title: "New Suggestion",
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
                () => {
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
    description: "Suggest something new for dad bot!",
    fullDescription:
      "Suggest something new for dad bot! Gets sent to the discord server!",
  },
};

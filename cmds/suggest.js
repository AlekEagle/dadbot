"use strict";

const Perspective = require("perspective-api-client");
const perspective = new Perspective({ apiKey: process.env.perspectiveKey });
const suggestions = require('../functions/suggestionsManager');

module.exports = {
    name: "suggest",

    exec: (client, msg, args) => {
        if (args.length <= 2) {
            msg.channel.createMessage(
                `a suggestion ${args.length} word${args.length === 1 ? "" : "s"
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
                        suggestions.create(2, msg, args.join(' ')).then(suggestion => {
                            msg.channel.createMessage(`The Dad Bot crew has been notified. Your feedback ID for reference is \`${suggestion.id}\`.`);
                        }, () => {
                            msg.channel.createMessage('That didn\'t work for some reason, try again later.');
                        });
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

"use strict";

const Perspective = require("perspective-api-client");
const perspective = new Perspective({ apiKey: process.env.perspectiveKey });
const suggestions = require('../functions/suggestionsManager');


module.exports = {
    name: "compliment",

    exec: (client, msg, args) => {
        if (args.length <= 2) {
            msg.channel.createMessage(
                `a compliment ${args.length} word${args.length === 1 ? "" : "s"
                } long isn't very helpful.`
            );
        } else {
            perspective.analyze(args.join(" ")).then((output) => {
                if (output.attributeScores.TOXICITY.summaryScore.value > 0.625) {
                    msg.channel.createMessage(
                        "Probably the worst attempt at trying to pass something mean as a compliment."
                    );
                } else {
                    suggestions.create(1, msg, args.join(' ')).then(suggestion => {
                        msg.channel.createMessage(`The Dad Bot crew has been notified. Your feedback ID for reference is \`${suggestion.id}\`.`);
                    }, () => {
                        msg.channel.createMessage('That didn\'t work for some reason, try again later.');
                    });
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

'use strict';

const suggestions = require('../functions/suggestionsHandler');
const ms = require('ms');

module.exports = {
    name: 'suggest',

    exec: (client, msg, args) => {
        suggestions.addSuggestion(msg, args);
    },

    options: {
        description: 'Use this to suggest ideas for different things!',
        usage: '<embarrass|joke|cmd|feedback> <suggestion>',
        fullDescription: 'This command is one of three for a new suggestion system, Using the `suggest` command, you can suggest new ideas for various things.\nUsing the `suggestions` command you can view and vote on other suggestions, via the `suggestions` command, if you downvote your own suggestion it will automatically removed from the suggestions. All suggestions will be reviewed manually.',
        guildOnly: true,
        cooldown: ms('1 hour')
    }
}
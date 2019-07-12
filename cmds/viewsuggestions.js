'use strict';

const suggestions = require('../functions/suggestionsHandler');
const ms = require('ms');

module.exports = {
    name: 'suggestions',

    exec: (client, msg, args) => {
        if (suggestions.suggestions.length >= 1) {
            let currentSelection = 0;
            msg.channel.createMessage({
                embed: {
                    title: 'Suggestions',
                    description: 'Use the ⬆ ⬇ emojis to select a suggestion, use 🔼 🔽 to upvote or downvote a suggestion. Use 🔚 to end the selection.',
                    fields: [
                        {
                            name: 'Current Selection',
                            value: `${suggestions.suggestions[currentSelection].suggestion}\n${suggestions.suggestions[currentSelection].type}\n${suggestions.suggestions[currentSelection].upVotes.length} Upvotes\n${suggestions.suggestions[currentSelection].downVotes.length} Downvotes\nBy ${client.users.get(suggestions.suggestions[currentSelection].person) ? client.users.get(suggestions.suggestions[currentSelection].person).username : 'NotFound'}#${client.users.get(suggestions.suggestions[currentSelection].person) ? client.users.get(suggestions.suggestions[currentSelection].person).discriminator : 'NotFound'} (${suggestions.suggestions[currentSelection].person})`
                        },
                        {
                            name: 'Suggestions',
                            value: suggestions.suggestions.map(s => s.suggestion).join('\n')
                        }
                    ]
                }
            }).then(message => {
                function editMessage() {
                    message.edit({
                        embed: {
                            title: 'Suggestions',
                            description: 'Use the ⬆ ⬇ emojis to select a suggestion, use 🔼 🔽 to upvote or downvote a suggestion. Use 🔚 to end the selection.',
                            fields: [
                                {
                                    name: 'Current Selection',
                                    value: `${suggestions.suggestions[currentSelection].suggestion}\n${suggestions.suggestions[currentSelection].type}\n${suggestions.suggestions[currentSelection].upVotes.length} Upvotes\n${suggestions.suggestions[currentSelection].downVotes.length} Downvotes\nBy ${client.users.get(suggestions.suggestions[currentSelection].person) ? client.users.get(suggestions.suggestions[currentSelection].person).username : 'NotFound'}#${client.users.get(suggestions.suggestions[currentSelection].person) ? client.users.get(suggestions.suggestions[currentSelection].person).discriminator : 'NotFound'} (${suggestions.suggestions[currentSelection].person})`
                                },
                                {
                                    name: 'Suggestions',
                                    value: suggestions.suggestions.map(s => s.suggestion).join('\n')
                                }
                            ]
                        }
                    })
                }
                message.addReaction('⬇').then(() => message.addReaction('⬆').then(() => message.addReaction('🔼').then(() => message.addReaction('🔽').then(() => message.addReaction('🔚')))));
                function handleReactions(mes, emoji, user) {
                    if (mes.id === message.id && user === msg.author.id) {
                        let reactor = message.channel.guild.members.get(user);
                        switch (emoji.name) {
                            case '⬇':
                                if (++currentSelection === suggestions.suggestions.length) currentSelection = 0;
                                editMessage();
                            break;
                            case '⬆':
                                if (--currentSelection === -1) currentSelection = suggestions.suggestions.length - 1;
                                editMessage();
                            break;
                            case '🔼':
                                if (suggestions.moderateSuggestion(client, currentSelection, 'upvote', null, msg)) {
                                    editMessage();
                                    message.edit('Successfully upvoted suggestion!');
                                }else {
                                    editMessage();
                                    message.edit('Successfully removed upvote on the suggestion!');
                                }
                                currentSelection = 0;
                                editMessage();
                            break;
                            case '🔽':
                                var response = suggestions.moderateSuggestion(client, currentSelection, 'downvote', null, msg);
                                if (response === 'deleted') {
                                    editMessage();
                                    message.edit('Successfully deleted your suggestion!');
                                }else if (response) {
                                    editMessage();
                                    message.edit('Successfully downvoted suggestion!');
                                }else {
                                    editMessage();
                                    message.edit('Successfully removed downvote on the suggestion!');
                                }
                                currentSelection = 0;
                                editMessage();
                            break;
                            case '🔚':
                                message.edit('Done viewing suggestions!').then(() => {
                                    client.off('messageReactionAdd', handleReactions);
                                    setTimeout(() => message.delete(), 5000);
                                });
                            break;
                        }
                        message.removeReaction(emoji.name, reactor.id).catch(() => {});
                    }
                }
                client.on('messageReactionAdd', handleReactions);
            })
        }else {
            msg.channel.createMessage('There\'s no suggestions right now!');
        }
    },

    options: {
        description: 'View and vote on suggestions',
        guildOnly: true,
        fullDescription: 'This command is one of three for a new suggestion system, Using the `suggest` command, you can suggest new ideas for various things.\nUsing the `suggestions` command you can view and vote on other suggestions, via the `suggestions` command, if you downvote your own suggestion it will automatically removed from the suggestions. All suggestions will be reviewed manually.',
        cooldown: ms('5 minutes'),
        cooldownMessage: 'Hang on there buddy, you have a cooldown for this command, please wait at least an hour before trying again.'
    }
}
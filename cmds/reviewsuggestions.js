'use strict';

const suggestions = require('../functions/suggestionsHandler');
const owners = require('../functions/getOwners');
const getUser = require('../functions/userAcrossShards');

module.exports = {
    name: 'reviewsuggestions',

    exec: (client, msg, args) => {
        if (owners.isOwner(msg.author.id)) {
            if (suggestions.suggestions.length < 1) {
                msg.channel.createMessage('There are no suggestions right now!');
            }else {
                let currentSelected = 0;
                msg.channel.createMessage({
                    embed: {
                        title: 'Suggestion Reviewer v0.5.1 alpha',
                        fields: [
                            {
                                name: 'Current Suggestion',
                                value: suggestions.suggestions[currentSelected].suggestion ? suggestions.suggestions[currentSelected].suggestion : 'nothing here???',
                                inline: false
                            },
                            {
                                name: 'Person who had the idea',
                                value: `${getUser(suggestions.suggestions[currentSelected].person) ? getUser(suggestions.suggestions[currentSelected].person).username : 'NotFound'}#${getUser(suggestions.suggestions[currentSelected].person) ? getUser(suggestions.suggestions[currentSelected].person).discriminator : 'NotFound'} (${suggestions.suggestions[currentSelected].person})`,
                                inline: false
                            },
                            {
                                name: 'Type',
                                value: suggestions.suggestions[currentSelected].type,
                                inline: true
                            },
                            {
                                name: 'Upvotes',
                                value: suggestions.suggestions[currentSelected].upVotes.length,
                                inline: true
                            },
                            {
                                name: 'Downvotes',
                                value: suggestions.suggestions[currentSelected].downVotes.length,
                                inline: true
                            },
                            {
                                name: 'Number of suggestions to approve',
                                value: suggestions.suggestions.length,
                                inline: true
                            }
                        ]
                    }
                }).then(message => {
                    function editMessage() {
                        message.edit({
                            embed: {
                                title: 'Suggestion Reviewer v0.5.1 alpha',
                                fields: [
                                    {
                                        name: 'Current Suggestion',
                                        value: suggestions.suggestions[currentSelected].suggestion ? suggestions.suggestions[currentSelected].suggestion : 'nothing here???',
                                        inline: false
                                    },
                                    {
                                        name: 'Person who had the idea',
                                        value: `${getUser(suggestions.suggestions[currentSelected].person) ? getUser(suggestions.suggestions[currentSelected].person).username : 'NotFound'}#${getUser(suggestions.suggestions[currentSelected].person) ? getUser(suggestions.suggestions[currentSelected].person).discriminator : 'NotFound'} (${suggestions.suggestions[currentSelected].person})`,
                                        inline: false
                                    },
                                    {
                                        name: 'Type',
                                        value: suggestions.suggestions[currentSelected].type,
                                        inline: true
                                    },
                                    {
                                        name: 'Upvotes',
                                        value: suggestions.suggestions[currentSelected].upVotes.length,
                                        inline: true
                                    },
                                    {
                                        name: 'Downvotes',
                                        value: suggestions.suggestions[currentSelected].downVotes.length,
                                        inline: true
                                    },
                                    {
                                        name: 'Number of suggestions to approve',
                                        value: suggestions.suggestions.length,
                                        inline: true
                                    }
                                ]
                            }
                        })
                    }
                    message.addReaction('⬇').then(() => message.addReaction('⬆').then(() => message.addReaction('✅').then(() => message.addReaction('❎').then(() => message.addReaction('🔚')))));
                    function handleReactions(mes, emoji, user) {
                        if (mes.id === message.id && user === msg.author.id) {
                            let reactor = message.channel.guild.members.get(user);
                            switch (emoji.name) {
                                case '⬇':
                                    if (++currentSelected === suggestions.suggestions.length) currentSelected = 0;
                                    editMessage();
                                break;
                                case '⬆':
                                    if (--currentSelected === -1) currentSelected = suggestions.suggestions.length - 1;
                                    editMessage();
                                break;
                                case '✅':
                                    suggestions.moderateSuggestion(client, currentSelected, 'approve', null, msg);
                                    currentSelected = 0;
                                    if (suggestions.suggestions.length < 1) {
                                        client.off('messageReactionAdd', handleReactions);
                                        message.edit('No more suggestions to review!').then(() => {
                                            setTimeout(() => message.delete(), 5000);
                                        });
                                    }else {
                                        editMessage();
                                    }
                                break;
                                case '❎':
                                    message.channel.createMessage('Please provide a reason for rejecting this suggestion.').then(() => {
                                        function handleRejectReason(mos) {
                                            if (mos.channel.id === msg.channel.id && mos.author.id === msg.author.id) {
                                                suggestions.moderateSuggestion(client, currentSelected, 'deny', mos.content, msg);
                                                client.getMessages(mos.channel.id, 2).then(messages => {
                                                    client.deleteMessages(mos.channel.id, messages.map(m => m.id));
                                                });
                                                currentSelected = 0;
                                                if (suggestions.suggestions.length < 1) {
                                                    client.off('messageCreate', handleRejectReason);
                                                    client.off('messageReactionAdd', handleReactions);
                                                    message.edit('No more suggestions to review!').then(() => {
                                                        setTimeout(() => message.delete(), 5000);
                                                    });
                                                }else {
                                                    client.off('messageCreate', handleRejectReason);
                                                    editMessage();
                                                }
                                            }
                                        }
                                        client.on('messageCreate', handleRejectReason);
                                    })
                                break;
                                case '🔚':
                                    message.edit('Done reviewing suggestions!').then(() => {
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
            }
        }else client.createMessage(msg.channel.id, 'You need the permission `BOT_OWNER` to use this command!')
    },

    options: {
        hidden: true
    }
}
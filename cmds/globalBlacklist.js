'use strict';

const owners = require('../functions/getOwners'),
    globalBlacklist = require('../functions/globalBlacklist'),
    ms = require('ms'),
    numPerPage = 5,
    permissionOverwrites = require('../functions/permissionOverwrites');

module.exports = {
    name: 'globalblacklist',

    exec: (client, msg, args) => {
        if (permissionOverwrites(msg.channel, client.user.id, 'manageMessages') === null ? !msg.channel.guild.members.get(client.user.id).permission.has('manageMessages') : !permissionOverwrites(msg.channel, client.user.id, 'manageMessages')) {
            return;
        }
        if (!owners.isOwner(msg.author.id)) {
            return;
        }
        let page = 0,
            cursorPos = 0,
            state = 'mainmenu',
            timeout = null;

        globalBlacklist.GlobalBlacklist.findAll().then(values => {
            msg.channel.createMessage({
                embed: {
                    title: 'Bad People, Servers, and Channels',
                    thumbnail: {
                        url: client.user.dynamicAvatarURL('png', 512)
                    },
                    description: 'Blacklist Manager 1.5.8',
                    fields: values.slice(0 + (numPerPage * page), numPerPage + (numPerPage * page)).map((v, i, c) => {
                        return {
                            name: `${cursorPos === i ? '> ': ''}${v.id}`,
                            value: `\`\`\`\n${v.cmds.join('\n')}\`\`\``,
                            inline: false
                        };
                    }),
                    footer: {
                        text: `Page ${page+1} of ${Math.ceil(values.length / numPerPage)}`
                    }
                }
            }).then(message => {
                function addReactions(msgObj, emojis) {
                    emojis.forEach(e => {
                        msgObj.addReaction(e);
                    });
                }

                timeout = setTimeout(() => {
                    message.channel.createMessage(`${msg.member.mention} the menu was cancelled due to inactivity!`).then(mesg => {
                        client.off('messageReactionAdd', handleReactions);
                        msg.delete();
                        message.delete();
                        setTimeout(() => {
                            mesg.delete();
                        }, ms('5sec'));
                    });
                }, ms('1min'));

                addReactions(message, ['🔼', '🔽', '➖', '➕', '🖋', '⏹']);

                function handleReactions(mesg, emoji, userID) {
                    if (!client.users.get(userID).bot) {
                        message.removeReaction(emoji.name, userID).catch(() => {});
                    }
                    if (userID !== msg.author.id || mesg.id !== message.id) return;
                    clearTimeout(timeout);
                    timeout = setTimeout(() => {
                        message.channel.createMessage(`${msg.member.mention} the menu was cancelled due to inactivity!`).then(mesg => {
                            client.off('messageReactionAdd', handleReactions);
                            msg.delete();
                            message.delete();
                            setTimeout(() => {
                                mesg.delete();
                            }, ms('5sec'));
                        });
                    }, ms('1min'));

                    switch (state) {
                        case 'mainmenu':
                            switch (emoji.name) {
                                case '⏹':
                                    message.delete();
                                    msg.delete();
                                    clearTimeout(timeout);
                                    client.off('messageReactionAdd', handleReactions);
                                    break;
                                case '🔼':
                                    --cursorPos;
                                    globalBlacklist.GlobalBlacklist.findAll().then(values => {
                                        if (cursorPos < 0) {
                                            --page;
                                            if (page < 0) {
                                                page = Math.ceil(values.length / numPerPage) - 1;
                                            }
                                            cursorPos = values.slice(0 + (numPerPage * page), numPerPage + (numPerPage * page)).length - 1;
                                        }
                                        if (cursorPos > values.slice(0 + (numPerPage * page), numPerPage + (numPerPage * page)).length - 1) {
                                            ++page;
                                            if (page > Math.ceil(values.length / numPerPage) - 1) {
                                                page = 0;
                                            }
                                            cursorPos = 0;
                                        }
                                        message.edit({
                                            embed: {
                                                title: 'Bad People, Servers, and Channels',
                                                thumbnail: {
                                                    url: client.user.dynamicAvatarURL('png', 512)
                                                },
                                                description: 'Blacklist Manager 1.5.8',
                                                fields: values.slice(0 + (numPerPage * page), numPerPage + (numPerPage * page)).map((v, i, c) => {
                                                    return {
                                                        name: `${cursorPos === i ? '> ': ''}${v.id}`,
                                                        value: `\`\`\`\n${v.cmds.join('\n')}\`\`\``,
                                                        inline: false
                                                    };
                                                }),
                                                footer: {
                                                    text: `Page ${page+1} of ${Math.ceil(values.length / numPerPage)}`
                                                }
                                            }
                                        });
                                    });
                                    break;
                                case '🔽':
                                    ++cursorPos;
                                    globalBlacklist.GlobalBlacklist.findAll().then(values => {
                                        if (cursorPos < 0) {
                                            --page;
                                            if (page < 0) {
                                                page = Math.ceil(values.length / numPerPage) - 1;
                                            }
                                            cursorPos = values.slice(0 + (numPerPage * page), numPerPage + (numPerPage * page)).length - 1;
                                        }
                                        if (cursorPos > values.slice(0 + (numPerPage * page), numPerPage + (numPerPage * page)).length - 1) {
                                            ++page;
                                            if (page > Math.ceil(values.length / numPerPage) - 1) {
                                                page = 0;
                                            }
                                            cursorPos = 0;
                                        }
                                        message.edit({
                                            embed: {
                                                title: 'Bad People, Servers, and Channels',
                                                thumbnail: {
                                                    url: client.user.dynamicAvatarURL('png', 512)
                                                },
                                                description: 'Blacklist Manager 1.5.8',
                                                fields: values.slice(0 + (numPerPage * page), numPerPage + (numPerPage * page)).map((v, i, c) => {
                                                    return {
                                                        name: `${cursorPos === i ? '> ': ''}${v.id}`,
                                                        value: `\`\`\`\n${v.cmds.join('\n')}\`\`\``,
                                                        inline: false
                                                    };
                                                }),
                                                footer: {
                                                    text: `Page ${page+1} of ${Math.ceil(values.length / numPerPage)}`
                                                }
                                            }
                                        });
                                    });
                                    break;
                                case '➕':
                                    state = 'addblacklistitemid';
                                    msg.channel.createMessage('Say the ID of the user, channel, or guild you would like to add to the blacklist.').then(messg => {
                                        let id, cmds;
                                        function handleAddBlacklistItem(messag) {
                                            if (messag.author.id !== msg.author.id || messag.channel.id !== msg.channel.id) return;
                                            switch (state) {
                                                case 'addblacklistitemid':
                                                    id = messag.content.replace(/^<?#?@?!?(\d+)>? ?$/, '$1');
                                                    messag.delete();
                                                    messg.edit('Great, now I need a comma separated string of all the commands this entry will be blacklisted from!');
                                                    state = 'addblacklistitemcmds';
                                                    break;
                                                case 'addblacklistitemcmds':
                                                    cmds = messag.content.split(/, ?/g);
                                                    messag.delete();
                                                    messg.edit('Alright, that\'s all I need! Entry added!');
                                                    setTimeout(() => {
                                                        messg.delete();
                                                    }, ms('5sec'));
                                                    globalBlacklist.updateValue({id, cmds}).then(() => {
                                                        client.off('messageCreate', handleAddBlacklistItem);
                                                        state = 'mainmenu';
                                                        globalBlacklist.GlobalBlacklist.findAll().then(values => {
                                                            message.edit({
                                                                embed: {
                                                                    title: 'Bad People, Servers, and Channels',
                                                                    thumbnail: {
                                                                        url: client.user.dynamicAvatarURL('png', 512)
                                                                    },
                                                                    description: 'Blacklist Manager 1.5.8',
                                                                    fields: values.slice(0 + (numPerPage * page), numPerPage + (numPerPage * page)).map((v, i, c) => {
                                                                        return {
                                                                            name: `${cursorPos === i ? '> ': ''}${v.id}`,
                                                                            value: `\`\`\`\n${v.cmds.join('\n')}\`\`\``,
                                                                            inline: false
                                                                        };
                                                                    }),
                                                                    footer: {
                                                                        text: `Page ${page+1} of ${Math.ceil(values.length / numPerPage)}`
                                                                    }
                                                                }
                                                            });
                                                        });
                                                    });
                                                    break;
                                            }
                                        }
                                        client.on('messageCreate', handleAddBlacklistItem);
                                    })
                                    break;
                                case '➖':
                                    globalBlacklist.GlobalBlacklist.findAll().then(values => {
                                        globalBlacklist.updateValue({
                                            id: values.slice(0 + (numPerPage * page), numPerPage + (numPerPage * page))[cursorPos].id,
                                            cmds: []
                                        }).then(() => {
                                            globalBlacklist.GlobalBlacklist.findAll().then(values => {
                                                if (values.slice(0 + (numPerPage * page), numPerPage + (numPerPage * page)).length === 0) {
                                                    --page;
                                                    cursorPos = values.slice(0 + (numPerPage * page), numPerPage + (numPerPage * page)).length - 1;
                                                }
                                                if (values.slice(0 + (numPerPage * page), numPerPage + (numPerPage * page))[cursorPos] === undefined) --cursorPos;
                                                message.edit({
                                                    embed: {
                                                        title: 'Bad People, Servers, and Channels',
                                                        thumbnail: {
                                                            url: client.user.dynamicAvatarURL('png', 512)
                                                        },
                                                        description: 'Blacklist Manager 1.5.8',
                                                        fields: values.slice(0 + (numPerPage * page), numPerPage + (numPerPage * page)).map((v, i, c) => {
                                                            return {
                                                                name: `${cursorPos === i ? '> ': ''}${v.id}`,
                                                                value: `\`\`\`\n${v.cmds.join('\n')}\`\`\``,
                                                                inline: false
                                                            };
                                                        }),
                                                        footer: {
                                                            text: `Page ${page+1} of ${Math.ceil(values.length / numPerPage)}`
                                                        }
                                                    }
                                                });
                                            });
                                        });
                                    });
                                    break;
                                case '🖋':
                                    state = 'editblacklistitem';
                                    msg.channel.createMessage(`Editing \`${values.slice(0 + (numPerPage * page), numPerPage + (numPerPage * page))[cursorPos].id}\`, send me a comma separated string of all the commands this entry will be blacklisted from!`).then(messg => {
                                        let cmds;
                                        function handleEditBlacklistItem(messag) {
                                            if (messag.author.id !== msg.author.id || messag.channel.id !== msg.channel.id) return;
                                            cmds = messag.content.split(/, ?/g);
                                            messag.delete();
                                            messg.edit('Alright! Entry updated!');
                                            setTimeout(() => {
                                                messg.delete();
                                            }, ms('5sec'));
                                            globalBlacklist.updateValue({id: values.slice(0 + (numPerPage * page), numPerPage + (numPerPage * page))[cursorPos].id, cmds}).then(() => {
                                                client.off('messageCreate', handleEditBlacklistItem);
                                            state = 'mainmenu';
                                            globalBlacklist.GlobalBlacklist.findAll().then(values => {
                                                message.edit({
                                                    embed: {
                                                        title: 'Bad People, Servers, and Channels',
                                                        thumbnail: {
                                                            url: client.user.dynamicAvatarURL('png', 512)
                                                        },
                                                        description: 'Blacklist Manager 1.5.8',
                                                        fields: values.slice(0 + (numPerPage * page), numPerPage + (numPerPage * page)).map((v, i, c) => {
                                                            return {
                                                                name: `${cursorPos === i ? '> ': ''}${v.id}`,
                                                                value: `\`\`\`\n${v.cmds.join('\n')}\`\`\``,
                                                                inline: false
                                                            };
                                                        }),
                                                        footer: {
                                                            text: `Page ${page+1} of ${Math.ceil(values.length / numPerPage)}`
                                                        }
                                                    }
                                                });
                                            });
                                            });
                                        }
                                        client.on('messageCreate', handleEditBlacklistItem);
                                    })
                                    break;
                            }
                    }
                }
                client.on('messageReactionAdd', handleReactions);
            });
        });
    },

    options: {
        aliases: ['gblacklist', 'gblk', 'gb', 'blacklist', 'bl', 'blk', 'gbl'],
        fullDescription: 'Manage the global blacklist across the bots!',
        hidden: true
    }
}
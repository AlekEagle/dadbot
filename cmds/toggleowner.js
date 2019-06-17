'use strict';

let owners = require('../functions/getOwners');

module.exports = {
    name: 'toggleowner',

    exec: (client, msg, args) => {
        var ownerID = args[0].replace(/(<@|!|>)/g, '')
        if (owners.isOwner(msg.author.id)) {
            if (owners.isOwner(ownerID)) {
                owners.removeOwner(ownerID, msg.author.id).then(() => {
                    msg.channel.createMessage('They are no longer an owner!');
                }, (err) => {
                    if (err.message === 'functionCaller doesn\'t have permissions to affect other owner') msg.channel.createMessage('You do not have permission to edit this owner!'); else msg.channel.createMessage('An unknown error occurred while proforming this action.');console.error(err);
                });
            }else if (!owners.isOwner(ownerID)) {
                owners.addOwner(ownerID, JSON.parse(args[1]), msg.author.id).then((newOwner) => {
                    msg.channel.createMessage(`They are now an owner! And there admin is set to ${newOwner.adminOwner}`)
                });
            }
        }else {
            msg.channel.createMessage('You need the permission `BOT_OWNER` to do this!');
        }
    },

    options: {
        hidden: true,
        description: 'adds or removes someone as an owner of the bot (owner only)',
        fullDescription: 'adds or removes someone as an owner of the bot (owner only)'
    }
}
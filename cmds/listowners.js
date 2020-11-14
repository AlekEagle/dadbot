'use strict';

const owners = require('../functions/getOwners');
const Map = require('collections/map');

module.exports = {
    name: 'owners',

    exec: (client, msg, args) => {

        let users,
            usersArr = [],
            i = 0;

        function getData() {
            return new Promise((resolve, reject) => {

                owners.Owners.findAll().then(usersDB => {
                    usersDB.forEach(usr => {
                        if (usr.id !== '1') {
                            client.getRESTUser(usr.id).then(user => {
                                usersArr.push([user.id, { ...user, admin: usr.admin }]);
                                if (++i < Number(process.env.instances)) getData().then(resolve);
                                else resolve();
                            }, reject);
                        } else {
                            usersArr.push(['1', {
                                id: "1",
                                createdAt: "2015-05-15T04:00:00.000Z",
                                mention: "<@1>",
                                bot: true,
                                username: "Clyde",
                                discriminator: "0001",
                                avatar: "f78426a064bc9dd24847519259bc42af",
                                system: true,
                                admin: usr.admin
                            }])
                        }
                    });
                }, reject);
            })
        }

        let output = [];
        getData().then(() => {
            users = new Map(usersArr);
            let ownerNames = users.map(o => o);
            output.push(`NAME${' '.repeat(ownerNames.map(e => `${e.username}#${e.discriminator}`.length).sort((a, b) => a - b).reverse()[0] - 4)}|USERID${' '.repeat(ownerNames.map(e => e.id.length).sort((a, b) => a - b).reverse()[0] - 6)}|ADMIN`)
            output.push(`${'-'.repeat(ownerNames.map(e => `${e.username}#${e.discriminator}`.length).sort((a, b) => a - b).reverse()[0])}+${'-'.repeat(ownerNames.map(e => e.id.length).sort((a, b) => a - b).reverse()[0])}+-----`)
            ownerNames.forEach(e => output.push(`${e.username}#${e.discriminator}${' '.repeat(ownerNames.map(e => `${e.username}#${e.discriminator}`.length).sort((a, b) => a - b).reverse()[0] - `${e.username}#${e.discriminator}`.length)}|${e.id}${' '.repeat(ownerNames.map(e => e.id.length).sort((a, b) => a - b).reverse()[0] - e.id.length)}|${users.get(e.id).admin}${' '.repeat(users.get(e.id).admin ? 1 : 0)}`));
            msg.channel.createMessage(`\`\`\`${output.join('\n')}\`\`\``);
        });
    },

    options: {
        description: 'Lists the owners of Dad Bot!'
    }
}
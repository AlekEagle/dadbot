'use strict';

module.exports = (channel, id, permission) => {
    let pO = channel.permissionOverwrites;
    if (pO.toJSON().hasOwnProperty(id)) {
        return pO.get(id).has(permission);
    } else if (channel.guild.members.get(id).roles.filter(r => pO.toJSON().hasOwnProperty(r)).length !== 0) {
        return channel.guild.members.get(id).roles.filter(r => pO.toJSON().hasOwnProperty(r)).map(r => pO.get(r).has(permission))[0];
    }else return null;
}
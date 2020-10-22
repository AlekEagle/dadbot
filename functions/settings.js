"use strict";

const Sequelize = require("sequelize");
const sequelize = new Sequelize(
    `postgres://alek:${process.env.serverPass}@127.0.0.1:5432/alekeagle`,
    {
        logging: false,
    }
);
class Options extends Sequelize.Model { }
Options.init(
    {
        id: { type: Sequelize.DataTypes.STRING, primaryKey: true },
        flags: Sequelize.DataTypes.SMALLINT,
        RNG: Sequelize.DataTypes.FLOAT,
    },
    {
        sequelize,
    }
);

Options.sync();

const flagNames = [
    "IM_RESPONSES",
    "KYS_RESPONSES",
    "SHUT_UP_RESPONSES",
    "PASTA_MODE",
    "WINNING_RESPONSES",
],
    cache = {};

Options.findAll().then(settings => {
    settings.forEach(setting => {
        cache[setting.id] = setting.toJSON();
    })
})

module.exports = {
    getFlags: (flags) => {
        let flagArray = [];
        for (let i in flagNames) {
            if (((flags >> i) & 1) == 1) flagArray.push(flagNames[i]);
        }
        return flagArray;
    },
    toFlags: (flagArray) => {
        let flags = 0;
        flagArray.forEach((it) => {
            flags += 1 << flagNames.indexOf(it);
        });
        return flags;
    },
    getValueByID: async (id) => {
        if (cache.hasOwnProperty(id)) return cache[id];
        let value = await Options.findOne({
            where: {
                id,
            },
        });
        if (!value) {
            return new Promise((resolve, reject) => {
                cache[id] = {

                    id,

                    flags: module.exports.toFlags([

                        "IM_RESPONSES",

                        "KYS_RESPONSES",

                        "SHUT_UP_RESPONSES",

                        "WINNING_RESPONSES",

                    ]),

                };
                resolve({
                    id,
                    flags: module.exports.toFlags([
                        "IM_RESPONSES",
                        "KYS_RESPONSES",
                        "SHUT_UP_RESPONSES",
                        "WINNING_RESPONSES",
                    ]),
                })
            });
        } else {
            cache[id] = value.toJSON();
            return value.toJSON();
        }
    },
    updateValue: async (options) => {
        if (
            options.flags ===
            module.exports.toFlags([
                "IM_RESPONSES",
                "KYS_RESPONSES",
                "SHUT_UP_RESPONSES",
                "WINNING_RESPONSES",
            ])
        ) {
            delete cache[options.id];
            let res = await Options.findOne({
                where: {
                    id: options.id,
                },
            });
            return await res.destroy();
        } else {
            cache[options.id] = options;
            return await Options.update(options, {
                where: {
                    id: options.id,
                },
            });
        }
    },
    flags: flagNames
};

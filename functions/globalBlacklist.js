"use strict";
const Sequelize = require("sequelize");
const ms = require("ms");

class GlobalBlacklist extends Sequelize.Model { }
GlobalBlacklist.init(
    {
        id: { type: Sequelize.DataTypes.STRING, primaryKey: true },
        cmds: Sequelize.DataTypes.ARRAY(Sequelize.DataTypes.STRING),
    },
    {
        sequelize: _database,
    }
);

GlobalBlacklist.sync().then(() => {
    console.info("Synced GlobalBlacklist successfully!");
});

const cache = {};

setInterval(() => {
    GlobalBlacklist.findAll().then((vals) => {
        vals.forEach((stat) => {
            if (cache.hasOwnProperty(stat.id) ? cache[stat.id] !== stat : false) {
                cache[stat.id] = stat;
            }
        });

        Object.values(cache).forEach((cached) => {
            if (!vals.hasOwnProperty(cached.id)) {
                delete cache[cached.id];
            }
        });
    });
}, ms("10sec"));

module.exports = {
    getValueByID: async (id) => {
        if (cache.hasOwnProperty(id)) return cache[id];
        let value = await GlobalBlacklist.findOne({
            where: {
                id,
            },
        });
        if (value) {
            cache[id] = value;
            return value;
        } else return null;
    },
    updateValue: async (opts) => {
        if (opts.cmds.length === 0) {
            if (cache.hasOwnProperty(opts.id)) delete cache[opts.id];
            return await GlobalBlacklist.destroy({
                where: {
                    id: opts.id,
                },
            });
        } else {
            let value = await GlobalBlacklist.findOne({
                where: {
                    id: opts.id,
                },
            });
            if (value === null) return GlobalBlacklist.create(opts);
            else {
                let newVal = await value.update(opts);
                cache[opts.id] = newVal;
                return newVal;
            }
        }
    },

    GlobalBlacklist,
};

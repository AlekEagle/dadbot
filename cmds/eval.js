'use strict';

let nums = require('../functions/numbers');
let settings = require('../functions/settings');
let globalBlacklist = require('../functions/globalBlacklist');
let owners = require('../functions/getOwners');
let util = require('util');
let prefixes = require('../functions/managePrefixes');
let toHHMMSS = require('../functions/toReadableTime');
let genRanString = require('../functions/genRanString');
let stats = require('../functions/commandStatistics');
let lists = require('../functions/lists');
let memory = require('../functions/memoryUsage');
let fs = require('fs');
const Logger = require('../functions/logger');
const console = new Logger();

module.exports = {
    name: 'eval',

    exec: (client, msg, args) => {
        if (owners.isAdminOwner(msg.author.id)) {
            try {
                var evalCommand = args.join(' ');
                let evaluation = eval(evalCommand);
                if (typeof evaluation !== "string") {
                    evaluation = util.inspect(evaluation).replace(client.token, '(insert token here)')
                } else {
                    evaluation = evaluation.replace(client.token, '(insert token here)')
                }
                if (evaluation.length > 2000) {
                    client.createMessage(msg.channel.id, 'Output too large, heres a file instead!', {file: Buffer.from(evaluation), name: 'output.txt'})
                } else {
                    client.createMessage(msg.channel.id, evaluation)
                }
            } catch (err) {
                client.createMessage(msg.channel.id, 'OOF ERROR:\ninput: ```' + evalCommand + '``` output: ```' + err + '```')
            }
        } else client.createMessage(msg.channel.id, 'You need the permission `BOT_ADMIN_OWNER` to use this command!')

    },

    options: {
        hidden: true,
        fullDescription: 'Evaluates code with a command (owner only)',
        aliases: [
            'evaluate',
            'ev'
        ],
        removeWhitespace: false
    }
}

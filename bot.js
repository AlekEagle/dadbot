const CommandClient = require('eris-command-handler');
const env = process.env;
const fs = require('fs');
const u_wut_m8 = require('./.auth.json');
const request = require('request');
const Logger = require('./functions/logger');
const console = new Logger();
let nums = require('./functions/numbers');
let settings = require('./functions/settings');
let globalBlacklist = require('./functions/globalBlacklist');
let stats = require('./functions/commandStatistics');
let owners = require('./functions/getOwners');
let prefixes = require('./functions/managePrefixes');
let ms = require('ms');
let fetch = require('node-fetch');
let time = require('./functions/toReadableTime');
let cpu = require('util').promisify(require('process-cpu-utilization').get);
let memory = require('./functions/memoryUsage');
const Sentry = require('@sentry/node');
Sentry.init({
    dsn: 'https://81fb39c6a5904886ba26a90e2a6ea8aa@sentry.io/1407724'
});
owners.initializeOwners().then(list => {
    console.log(`Loaded owners. There are currently ${list.users.length} owners.`);
}, (err) => {
    console.error(err)
});
const client = new CommandClient(env.DEBUG ? u_wut_m8.otherToken : u_wut_m8.token, {
    maxShards: env.DEBUG ? 1 : 'auto',
    getAllUsers: true,
    messageLimit: 0,
    defaultImageFormat: 'png',
    defaultImageSize: 2048
}, {
    description: 'complain and compliment aren\'t meant to be super serious.',
    owner: 'AlekEagle#0001',
    prefix: env.DEBUG ? 'test!' : 'd!'
});

client.editStatus('dnd', {
    type: 3,
    name: `myself start up!`
});

client.on('ready', () => {
    console.log('Connected.');
    client.editStatus('online', {
        type: 0,
        name: `how do I use this computer thingy?`
    });
    if (!env.DEBUG) {
        request.post(`https://maker.ifttt.com/trigger/bot_connected/with/key/${u_wut_m8.iftttToken}`, {
            json: {
                value1: 'Dad Bot'
            }
        }, () => {
            console.log(`Told IFTTT that shard (re)connected`);
        });
    }
    loadCmds();
    loadEvts();
});
prefixes.managePrefixes({
    action: 'refresh',
    client
}).then(prefixes => {
    console.log(`Loaded ${prefixes.length} guild prefix(es).`)
});
prefixes.on('newPrefix', (id, prefix) => client.registerGuildPrefix(id, prefix));
prefixes.on('removePrefix', (id) => {
    delete client.guildPrefixes[id];
});
prefixes.on('updatePrefix', (id, prefix) => {
    client.guildPrefixes[id] = prefix;
});
global.loadEvts = (reload) => {
    if (reload) {
        client.eventNames().forEach(e => {
            if (e !== 'ready') {
                var eventlisteners = client.rawListeners(e);
                if (e === 'messageReactionAdd' || e === 'messageReactionRemove' || e === 'messageCreate') {
                    eventlisteners = eventlisteners.slice(1);
                }
                eventlisteners.forEach(ev => {
                    client.removeListener(e, ev);
                })

            }
        });
    }
    var events = fs.readdirSync('./events');
    console.log(`Loading ${events.length} events, please wait...`)
    events.forEach(e => {
        var eventFile = require(`./events/${e}`);
        client.on(eventFile.name, (...args) => {
            eventFile.exec(client, ...args)
        });
    });
}

global.loadCmds = (reload) => {
    if (reload) {
        Object.values(client.commands).map(c => c.label).filter(c => c !== 'help').forEach(c => {
            client.unregisterCommand(c);
        });
    }
    var commands = fs.readdirSync('./cmds');
    console.log(`Loading ${commands.length} commands, please wait...`)
    commands.forEach(c => {
        var cmdFile = require(`./cmds/${c}`);
        stats.initializeCommand(cmdFile.name);
        client.registerCommand(cmdFile.name, (msg, args) => {
            globalBlacklist.getValueByID(msg.channel.id).then(stat => {
                if (stat === null ? false : (stat.cmds.includes('all') || stat.cmds.includes(cmdFile.name))) {
                    msg.channel.createMessage('This channel has been blacklisted from Dad Bot!, if you think this is a mistake, please go here https://alekeagle.com/discord and ask AlekEagle#0001 about this issue.\nThis channel may no longer use these commands: `' + stat.cmds.join(', ') + '`');
                    return;
                } else {
                    globalBlacklist.getValueByID(msg.author.id).then(stat => {
                        if (stat === null ? false : (stat.cmds.includes('all') || stat.cmds.includes(cmdFile.name))) {
                            msg.author.getDMChannel().then(chn => {
                                chn.createMessage('You have been blacklisted from Dad Bot! If you think this is a mistake, please go here https://alekeagle.com/discord and ask AlekEagle#0001 about this issue.\nYou may no longer use these commands: `' + stat.cmds.join(', ') + '`').catch(() => {
                                    msg.channel.createMessage(`<@${msg.author.id}> You have been blacklisted from Dad Bot! If you think this is a mistake, please go here https://alekeagle.com/discord and ask AlekEagle#0001 about this issue.\nYou may no longer use these commands: \`${stat.cmds.join(', ')}\``);
                                });
                            });
                        } else {
                            if (msg.channel.guild) {
                                globalBlacklist.getValueByID(msg.channel.guild.id).then(stat => {
                                    if (stat === null ? false : (stat.cmds.includes('all') || stat.cmds.includes(cmdFile.name))) {
                                        msg.channel.createMessage('This server has been blacklisted from Dad Bot!, if you think this is a mistake, please go here https://alekeagle.com/discord and ask AlekEagle#0001 about this issue.\nThis server may no longer use these commands: `' + stat.cmds.join(', ') + '`');
                                        return;
                                    } else {
                                        cmdFile.exec(client, msg, args);
                                    }
                                });
                            } else {
                                cmdFile.exec(client, msg, args);
                            }
                        }
                    });
                }
            });
        }, cmdFile.options);
    });
}
client.connect();
if (!env.DEBUG) setInterval(() => {
    cpu(['%cpu']).then(cpudata => {
        const data = {
            currentUptime: time(process.uptime()),
            commandsRan: nums.cmdsRan,
            messagesRead: nums.msgsRead,
            serverCount: client.guilds.size,
            userCount: client.users.size,
            shardCount: client.shards.size,
            CPU_USAGE: `${cpudata["%cpu"]}%`,
            MEM_USAGE: `${memory()} / ${memory(require("os").totalmem())}`,
            AVG_PING: `${
            Math.round(
              (100 *
                client.shards
                  .map((s) => s.latency)
                  .filter((a) => a !== Infinity)
                  .reduce((a, b) => a + b, 0)) /
                client.shards
                  .map((e) => e.latency)
                  .filter((a) => a !== Infinity).length
            ) / 100
          } ms`,
        };
        fetch('https://dad.eli.fail/data', {
            method: 'POST',
            headers: {
                "Content-Type": "application/json",
                Authorization: u_wut_m8.analytics_token,
            },
            body: JSON.stringify({
                data: data
            })
        });
    });
}, ms('1sec'));
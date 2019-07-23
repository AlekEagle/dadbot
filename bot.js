const CommandClient = require('eris-command-handler');
const env = process.env;
const fs = require('fs');
const u_wut_m8 = require('./.auth.json');
const DBL = require('dblapi.js');
const request = require('request');
const Logger = require('./functions/logger');
const console = new Logger();
let nums = require('./functions/numbers');
let manager = require('./functions/blacklistManager');
let stats = require('./functions/commandStatistics');
let owners = require('./functions/getOwners');
let prefixes = require('./functions/managePrefixes');
let shards = require('./functions/shardManager');
let suggestions = require('./functions/suggestionsHandler');
let i = 0;
const Sentry = require('@sentry/node');
Sentry.init({ dsn: 'https://81fb39c6a5904886ba26a90e2a6ea8aa@sentry.io/1407724' });
const dbl = new DBL(u_wut_m8.dblToken, {});
manager.manageBlacklist({action: 'refresh', blklist: 'blk'}).then(list => {
    console.log(`Loaded blacklist. There are currently ${list.users.length} user entry(s), ${list.servers.length} server entry(s), and ${list.channels.length} channel entry(s).`);
}, (err) => {
    console.error(err)
});
manager.manageBlacklist({action: 'refresh', blklist: 'pblk'}).then(list => {
    console.log(`Loaded pasta blacklist. There are currently ${list.servers.length} server entry(s).`);
}, (err) => {
    console.error(err)
});
manager.manageBlacklist({action: 'refresh', blklist: 'gblk'}).then(list => {
    console.log(`Loaded global user blacklist. There are currently ${list.users.length} user entry(s).`);
}, (err) => {
    console.error(err)
});
owners.initializeOwners().then(list => {
    console.log(`Loaded owners. There are currently ${list.users.length} owners.`);
}, (err) => {
    console.error(err)
});
suggestions.initializeSuggestions().then(suggestions => {
    console.log(`Loaded suggestions. There are currently ${suggestions.length} suggestions, get crackin!`);
}, (err) => {
    console.error(err)
});
function nextShard() {
    console.log(`Connecting to shard ${i}`);
    const client = new CommandClient(env.DEBUG ? u_wut_m8.otherToken : u_wut_m8.token, {
        firstShardID: i,
        lastShardID: i,
        maxShards: nums.shardCount,
        getAllUsers: true
    }, {
        description: 'We are now partnered with the discord bot DJ Putin! go check him out at <http://putin.ml:4276/> *use the suggestions command to suggest ideas! run "d!help suggest" for more help.*',
        owner: 'AlekEagle#0001',
        prefix: env.DEBUG ? 'test!' : 'd!'
    });
    function onDBLVote(data) {
        client.getDMChannel(data.user).then(msg => {
            msg.createMessage("Thanks for voting! This helps me a lot!").catch(() => {});
        }, () => {
            console.error('Unable to DM user')
        });
    }
    if (i < nums.shardCount && !env.DEBUG) request.post(`https://maker.ifttt.com/trigger/process_started/with/key/${u_wut_m8.iftttToken}`,{
            json: {
                value1: 'Dad Bot',
                value2: i.toString()
            }
        }, () => {
            console.log(`Told IFTTT that shard ${i} started`);
    });
    client.on('ready', () => {
        if (i < nums.shardCount) {
            prefixes.managePrefixes({action: 'refresh', client}).then(prefixes => {
                console.log(`Loaded ${prefixes.length} guild prefix(es).`)
            });
            prefixes.on('newPrefix', (id, prefix) => client.registerGuildPrefix(id, prefix));
            prefixes.on('removePrefix', (id) => {
                delete client.guildPrefixes[id];
            });
            prefixes.on('updatePrefix', (id, prefix) => {
                client.guildPrefixes[id] = prefix;
            });
            shards.connectShard(client.options.firstShardID, client);
            console.log(`Connected to shard ${i}`);
            let http = require('http'),
                app = require('express')(),
                server = http.createServer(app);
            app.post('/vote', (req, res) => {
                let body = '';
                req.on('data', chunk => {
                    body += chunk.toString();
                });
                req.on('end', () => {
                    body = JSON.parse(body)
                    if (body.type === 'test') {
                        console.log(body)
                        onDBLVote(body)
                    }else {
                        onDBLVote(body)
                    }
                    res.end('{"success":"true"}')
                })
            })
            app.get('/reloadcmds', (req, res) => {
                Object.values(client.commands).map(c => c.label).filter(c => c !== 'help').forEach(c => {
                    client.unregisterCommand(c);
                });
                var commands = fs.readdirSync('./cmds');
                console.log(`Loading ${commands.length} commands, please wait...`)
                commands.forEach(c => {
                    delete require.cache[require.resolve(`./cmds/${c}`)]
                    var cmdFile = require(`./cmds/${c}`);
                    stats.initializeCommand(cmdFile.name);
                    client.registerCommand(cmdFile.name, (msg, args) => {
                        stats.updateUses(cmdFile.name);
                        if (!manager.gblacklist.users.includes(msg.author.id)) {
                            cmdFile.exec(client, msg, args);
                        }else {
                            msg.author.getDMChannel().then(chn => {
                                chn.createMessage('You have been blacklisted from Dad bot! If you think this is a mistake, please go here https://alekeagle.tk/discord and ask AlekEagle#0001 about this issue.').catch(() => {
                                    msg.channel.createMessage(`<@${msg.author.id}> You have been blacklisted from Dad bot! If you think this is a mistake, please go here https://alekeagle.tk/discord and ask AlekEagle#0001 about this issue.`)
                                })
                            })
                        }
                    }, cmdFile.options)
                });
                res.end('{ "success": true }')
            });
            app.get('/reloadevts', (req, res) => {
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
                var events = fs.readdirSync('./events');
                console.log(`Loading ${events.length} events, please wait...`);
                events.forEach(e => {
                    delete require.cache[require.resolve(`./events/${e}`)];
                    var eventFile = require(`./events/${e}`);
                    client.on(eventFile.name, (...args) => {
                        eventFile.exec(client, ...args);
                    });
                });
            });
            app.post('/eval', (req, res) => {
                let nums = require('./functions/numbers');
                let manager = require('./functions/blacklistManager');
                let owners = require('./functions/getOwners');
                let util = require('util');
                let guildCount = require('./functions/getGuilds');
                let prefixes = require('./functions/managePrefixes');
                let toHHMMSS = require('./functions/toReadableTime');
                let genRanString = require('./functions/genRanString');
                let stats = require('./functions/commandStatistics');
                let shards = require('./functions/shardManager');
                let body = '';
                req.on('data', chunk => {
                    body += chunk.toString();
                });
                req.on('end', () => {
                    try {
                        let evaluation = eval(body);
                        if (typeof evaluation !== "string") {
                            evaluation = util.inspect(evaluation).replace(client.token, '(insert token here)')
                        }else {
                            evaluation = evaluation.replace(client.token, '(insert token here)')
                        }
                        if (evaluation.length > 2000) {
                            fs.writeFile('/home/pi/node_server/root/Dad_bot/eval_out/eval_output.txt', evaluation.replace(/\n/g, '<br>'), (err) => {
                                if (err != undefined) {
                                    res.end('An error occurred while this action was being preformed error code: `' + err.code + '`')
                                }
                            });
                            res.end('Output too large, it should be on your website at https://alekeagle.tk/Dad_bot/eval_out')
                        }else {
                            res.end(evaluation)
                        }
                    } catch (err) {
                        res.end('OOF ERROR:\ninput: ```' + body + '``` output: ```' + err + '```')
                    }
                })
            })
            server.listen(parseInt(`420${i}`))
        }
        if (i < nums.shardCount && !env.DEBUG) {
            request.post(`https://maker.ifttt.com/trigger/bot_restarted/with/key/${u_wut_m8.iftttToken}`,{
                json: {
                    value1: 'Dad Bot',
                    value2: client.options.firstShardID.toString()
                }
            }, () => {
                console.log(`Told IFTTT that shard ${client.options.firstShardID} connected`);
            });
            client.editStatus('online', {
                type: 0,
                name: `try ${client.commandOptions.prefix}help`
            });
        }else if (!env.DEBUG) {
            request.post(`https://maker.ifttt.com/trigger/bot_reconnected/with/key/${u_wut_m8.iftttToken}`,{
                json: {
                    value1: 'Dad Bot',
                    value2: client.options.firstShardID.toString()
                }
            }, () => {
                console.log(`Told IFTTT that shard ${client.options.firstShardID} reconnected`);
            });
        }
        if (!env.DEBUG) {
            setInterval(() => {
                dbl.postStats(client.guilds.size, client.options.firstShardID, nums.shardCount);
            }, 300000);
            dbl.postStats(client.guilds.size, client.options.firstShardID, nums.shardCount);
        }
        if (i < nums.shardCount) {
            i ++
            if (i < nums.shardCount) nextShard()
        }
    });
    var events = fs.readdirSync('./events');
    console.log(`Loading ${events.length} events, please wait...`)
    events.forEach(e => {
        var eventFile = require(`./events/${e}`);
        client.on(eventFile.name, (...args) => {
            eventFile.exec(client, ...args)
        })
    })
    var commands = fs.readdirSync('./cmds');
    console.log(`Loading ${commands.length} commands, please wait...`)
    commands.forEach(c => {
        var cmdFile = require(`./cmds/${c}`);
        stats.initializeCommand(cmdFile.name);
        client.registerCommand(cmdFile.name, (msg, args) => {
            stats.updateUses(cmdFile.name);
            if (!manager.gblacklist.users.includes(msg.author.id)) {
                cmdFile.exec(client, msg, args);
            }else {
                msg.author.getDMChannel().then(chn => {
                    chn.createMessage('You have been blacklisted from Dad bot! If you think this is a mistake, please go here https://alekeagle.tk/discord and ask AlekEagle#0001 about this issue.').catch(() => {
                        msg.channel.createMessage(`<@${msg.author.id}> You have been blacklisted from Dad bot! If you think this is a mistake, please go here https://alekeagle.tk/discord and ask AlekEagle#0001 about this issue.`)
                    })
                })
            }
        }, cmdFile.options)
    })
    client.connect();
}
nextShard();
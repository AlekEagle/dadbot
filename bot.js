const Eris = require('eris');
const fs = require('fs');
const u_wut_m8 = require('./.auth.json');
const DBL = require('dblapi.js');
const request = require('request');
let nums = require('./functions/numbers');
let manager = require('./functions/blacklistManager');
let stats = require('./functions/commandStatistics');
let owners = require('./functions/getOwners');
let i = 0;
const Sentry = require('@sentry/node');
Sentry.init({ dsn: 'https://81fb39c6a5904886ba26a90e2a6ea8aa@sentry.io/1407724' });
const dbl = new DBL(u_wut_m8.dblToken, {});
manager.manageBlacklist({action: 'refresh', blklist: 'blk'}).then(list => {
    console.log(`Loaded blacklist. There are currently ${list.users.length} user entry(s) and ${list.servers.length} server entry(s).`);
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
function nextShard() {
    console.log(`Connecting to shard ${i}`);
    const client = new Eris.CommandClient(u_wut_m8.token, {
        firstShardID: i,
        lastShardID: i,
        maxShards: nums.shardCount,
        getAllUsers: true
    }, {
        description: 'We need suggestions for `d!embarrass` and `d!dadjoke`! come suggest things at the server in: `d!invite`',
        owner: 'AlekEagle#0001',
        prefix: 'd!'
    });
    function onDBLVote(data) {
        client.getDMChannel(data.user).then(msg => {
            msg.createMessage("Oh hecc you voted! Thanks! This helps me a lot!")
        }, () => {
            console.error('Unable to DM user')
        });
    }
    if (i < nums.shardCount) request.post(`https://maker.ifttt.com/trigger/process_started/with/key/${u_wut_m8.iftttToken}`,{
            json: {
                value1: 'Dad Bot',
                value2: i.toString()
            }
        }, () => {
            console.log(`Told IFTTT that shard ${i} started`);
    });
    client.on('ready', () => {
        console.log(`Connected to shard ${i}`);
        if (i < nums.shardCount) {
            let http = require('http'),
                app = require('express')(),
                server = http.createServer(app);
            app.get('/servers', (req, res) => {
                res.statusCode = 200;
                res.end(client.guilds.size.toString())
            })
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
                    client.registerCommand(cmdFile.name, (msg, args) => cmdFile.exec(client, msg, args, nums.shardCount), cmdFile.options)
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
            server.listen(parseInt(`4203${i}`))
        }
        if (i < nums.shardCount) {
            request.post(`https://maker.ifttt.com/trigger/bot_restarted/with/key/${u_wut_m8.iftttToken}`,{
                json: {
                    value1: 'Dad Bot',
                    value2: client.guilds.map(g => g)[0].shard.id.toString()
                }
            }, () => {
                console.log(`Told IFTTT that shard ${client.guilds.map(g => g)[0].shard.id} connected`);
                i ++
                if (i < nums.shardCount) nextShard()
            });
        }else {
            request.post(`https://maker.ifttt.com/trigger/bot_reconnected/with/key/${u_wut_m8.iftttToken}`,{
                json: {
                    value1: 'Dad Bot',
                    value2: client.guilds.map(g => g)[0].shard.id.toString()
                }
            }, () => {
                console.log(`Told IFTTT that shard ${client.guilds.map(g => g)[0].shard.id} reconnected`);
            });
        }
        client.editStatus('online', {
            type: 0,
            name: `try d!help`
        });
        setInterval(() => {
            dbl.postStats(client.guilds.size, client.guilds.map(g => g)[0].shard.id, nums.shardCount);
        }, 300000);
        dbl.postStats(client.guilds.size, client.guilds.map(g => g)[0].shard.id, nums.shardCount);
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
        client.registerCommand(cmdFile.name, (msg, args) => cmdFile.exec(client, msg, args), cmdFile.options)
    })
    client.registerGuildPrefix('264445053596991498', 'daddy?')
    client.registerGuildPrefix('110373943822540800', 'daddy?')
    client.registerGuildPrefix('374071874222686211', 'daddy?')
    client.registerGuildPrefix('396440418507816960', 'daddy?')
    client.registerGuildPrefix('450100127256936458', 'daddy?')
    client.registerGuildPrefix('454933217666007052', 'daddy?')
    client.registerGuildPrefix('446425626988249089', 'daddy?')
    client.connect();
}
nextShard()
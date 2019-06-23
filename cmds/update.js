'use strict';

const exec = require('child_process').exec;
const Logger = require('../functions/logger');
console = new Logger();

module.exports = {
    name: 'update',

    exec: (client, msg, args) => {
        exec('sudo -u alekeagle git pull', (err, stdout, stderr) => {
            if(err || stderr) {
                msg.channel.createMessage(`An error occurred while updating, please check console for explaination.`);
                console.error(err);
                console.error(stderr);
            }else {
                msg.channel.createMessage(`Pulled from GitHub, running update...\n\`\`\`sh\n${stdout}\n\`\`\``).then(() => {
                    client.resolveCommand('recmds').execute(msg);
                    client.resolveCommand('reevts').execute(msg);
                    client.resolveCommand('refreshlists').execute(msg);
                });
            }
        })
    }
}
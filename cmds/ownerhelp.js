'use strict';

module.exports = {
    name: 'ownerhelp',

    exec: (client, msg, args) => {
        let result = "";
        if(args.length > 0) {
            let cur = client.commands[client.commandAliases[args[0]] || args[0]];
            if(!cur) {
                return "Command not found";
            }
            let {label} = cur;
            for(let i = 1; i < args.length; ++i) {
                cur = cur.subcommands[cur.subcommandAliases[args[i]] || args[i]];
                if(!cur) {
                    return "Command not found";
                }
                label += ` ${cur.label}`;
            }
            result += `**${msg.prefix}${label}** ${cur.usage}\n${cur.fullDescription}`;
            if(cur.aliases.length > 0) {
                result += `\n\n**Aliases:** ${cur.aliases.join(", ")}`;
            }
            const subcommands = Object.keys(cur.subcommands);
            if(subcommands.length > 0) {
                result += "\n\n**Subcommands:**";
                for(const subLabel of subcommands) {
                    if(cur.subcommands.hasOwnProperty(subLabel) && cur.subcommands[subLabel].permissionCheck(msg)) {
                        result += `\n  **${subLabel}** - ${cur.subcommands[subLabel].description}`;
                    }
                }
            }
        } else {
            result += `${client.commandOptions.name} - ${client.commandOptions.description}\n`;
            if(client.commandOptions.owner) {
                result += `by ${client.commandOptions.owner}\n`;
            }
            result += "\n**Commands:**\n";
            for(const label in client.commands) {
                if(client.commands.hasOwnProperty(label) && client.commands[label] && client.commands[label].permissionCheck(msg) && client.commands[label].hidden) {
                    result += `  **${msg.prefix}${label}** - ${client.commands[label].description}\n`;
                }
            }
            result += `\nType ${msg.prefix}help <command> for more info on a command.`;
        }
        msg.channel.createMessage(result);
    },

    options: {
        description: 'Owner commands for owners because owners need it'
    }
}
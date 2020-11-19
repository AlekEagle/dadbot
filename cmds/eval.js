"use strict";

const owners = require("../functions/getOwners");
const util = require("util");
const AsyncFunction = Object.getPrototypeOf(async function () { }).constructor;

function evaluateSafe(code, args) {
    const emitter = new (require("events"))();

    function safeWrapSetter(fn, setter, clearer, ...args) {
        const timeout = setter((...args) => {
            try {
                return fn(...args);
            } catch (error) {
                clearer(timeout);
                emitter.emit("timeoutError", error, setter.name);
            }
        }, ...args)
        return timeout;
    }

    const argss = Object.entries(Object.assign(args, {
        "setTimeout": (fn, ...args) => { return safeWrapSetter(fn, setTimeout, clearTimeout, ...args) },
        "setInterval": (fn, ...args) => { return safeWrapSetter(fn, setInterval, clearInterval, ...args) },
        "setImmediate": (fn, ...args) => { return safeWrapSetter(fn, setImmediate, clearImmediate, ...args) }
    }));

    const evalFn = new AsyncFunction(...argss.map(arg => arg[0]), `${code}`);
    Promise.resolve().then(() => evalFn(...argss.map(arg => arg[1]))).then(
        thing => { emitter.emit("complete", thing, false) },
        thing => { emitter.emit("complete", thing, true) }
    );
    return emitter;
}

module.exports = {
    name: "eval",

    exec: async (client, msg, args) => {
        const isAdmin = await owners.isAdmin(msg.author.id);
        if (isAdmin) {
            let emitter = evaluateSafe(args.join(" ").replace(/(^(?:```(?:js\n))|(?:(?:\n?)```)$)/g, ''), {
                "msg": msg,
                "client": client,
                "require": require
            });
            const evaledAt = Date.now();

            emitter.once("complete", (result, isErr) => {
                result = typeof result !== 'string' ? util.inspect(result) : result;
                const buffer = Buffer.from(result);
                if (result.length > 1900) {
                    if (buffer.length > 8388608) {
                        msg.channel.createMessage('The output is too big for a file! You\'re outta\' luck!');
                    } else {
                        msg.channel.createMessage('The output is too big to fit in a message, here\'s a file instead!', { name: 'output.txt', file: buffer });
                    }
                } else {
                    msg.channel.createMessage(`${isErr ? 'An error occurred:\n' : ''}\`\`\`js\n${result}\n\`\`\``).catch(() => {
                        msg.channel.createMessage('The output is too big to fit in a message, here\'s a file instead!', { name: 'output.txt', file: buffer });
                    });
                }
            });

            emitter.on("timeoutError", (error, type) => {
                error = typeof error !== "string" ? util.inspect(error) : error;
                const extra = Date.now() - evaledAt >= 10000 ? `${msg.author.mention}! ` : "";
                const buffer = Buffer.from(error);
                if (error.length > 1900) {
                    if (buffer.length > 8388608) {
                        msg.channel.createMessage(`${extra} There was an error in ${type} but it was too big for a file! You\'re outta\' luck, although I did clear the ${type} for you to prevent any more errors.`);
                    } else {
                        msg.channel.createMessage(`${extra} There was an error in ${type} but it was too big to fit in a message, here\'s a file instead! I've also cleared the ${type} for you to prevent any more errors.`, { name: 'output.txt', file: buffer });
                    }
                } else {
                    msg.channel.createMessage(`${extra} Error in ${type}: \`\`\`js\n${error}\n\`\`\`\nI've cleared the ${type} for you to prevent any more errors.`).catch(() => {
                        msg.channel.createMessage(`${extra} There was an error in ${type} but it was too big to fit in a message, here\'s a file instead! I've also cleared the ${type} for you to prevent any more errors.`, { name: 'output.txt', file: buffer });
                    });
                }
            });
        }
    },

    options: {
        hidden: true,
        fullDescription: "Evaluates code with a command (owner only)",
        aliases: ["evaluate", "ev"],
        removeWhitespace: true,
        whitespaceSeparator: /(\s(?<!\n))/g
    },
};

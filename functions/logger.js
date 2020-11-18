let chalk = require("chalk");
let _console = { ...require('console') };
let util = require('util');
let date = function getNowDateTimeStr() {
    let now = new Date();
    let hour = now.getHours();
    return [
        [
            AddZero(now.getDate()),
            AddZero(now.getMonth() + 1),
            now.getFullYear(),
        ].join("/"),
        [AddZero(hour), AddZero(now.getMinutes()), AddZero(now.getSeconds())].join(
            ":"
        ),
    ].join(" ");
};
const logLevels = [
    'NONE',
    'ERROR',
    'WARN',
    'LOG',
    'INFO',
    'DEBUG'
]

function AddZero(num) {
    return num >= 0 && num < 10 ? "0" + num : num + "";
}

class Logger {
    constructor(logLevel) {
        this.logLevel = typeof logLevel === 'string' ? logLevels.indexOf(logLevel) !== -1 ? logLevel : 'LOG' : logLevels[logLevel];
        this.logLevels = [...logLevels];
    }
    log(thing, ...args) {
        if (logLevels.indexOf(this.logLevel) < logLevels.indexOf('LOG')) return;
        _console.log(
            `${chalk.blue.inverse(date())} ${chalk.inverse(`[LOG]`)} ${chalk.white(
                typeof thing !== 'string' ? util.inspect(thing) : thing
            )}`,
            !args.length ? "" : args.map(a => typeof a !== 'string' ? util.inspect(a) : a).join(' ')
        );
        grafana.sendLog(typeof thing !== 'string' ? util.inspect(thing) : thing).catch(() => { });
    }
    warn(thing, ...args) {
        if (logLevels.indexOf(this.logLevel) < logLevels.indexOf('WARN')) return;
        _console.log(
            `${chalk.blue.inverse(date())} ${chalk
                .rgb(255, 124, 43)
                .inverse(`[WARN]`)} ${chalk.white(typeof thing !== 'string' ? util.inspect(thing) : thing)}`,
            !args.length ? "" : args.map(a => typeof a !== 'string' ? util.inspect(a) : a).join(' ')
        );
        grafana.sendError(typeof thing !== 'string' ? util.inspect(thing) : thing).catch(() => { });
    }
    debug(thing, ...args) {
        if (logLevels.indexOf(this.logLevel) < logLevels.indexOf('DEBUG')) return;
        _console.log(
            `${chalk.blue.inverse(date())} ${chalk.grey.inverse(
                `[DEBUG]`
            )} ${chalk.white(typeof thing !== 'string' ? util.inspect(thing) : thing)}`,
            !args.length ? "" : args.map(a => typeof a !== 'string' ? util.inspect(a) : a).join(' ')
        );
        grafana.sendLog(typeof thing !== 'string' ? util.inspect(thing) : thing).catch(() => { });
    }
    info(thing, ...args) {
        if (logLevels.indexOf(this.logLevel) < logLevels.indexOf('INFO')) return;
        _console.log(
            `${chalk.blue.inverse(date())} ${chalk
                .rgb(255, 255, 0)
                .inverse(`[INFO]`)} ${chalk.white(typeof thing !== 'string' ? util.inspect(thing) : thing)}`,
            !args.length ? "" : args.map(a => typeof a !== 'string' ? util.inspect(a) : a).join(' ')
        );
        grafana.sendLog(typeof thing !== 'string' ? util.inspect(thing) : thing).catch(() => { });
    }
    error(thing, ...args) {
        if (logLevels.indexOf(this.logLevel) < logLevels.indexOf('ERROR')) return;
        _console.log(
            `${chalk.blue.inverse(date())} ${chalk.bgRgb(
                255,
                0,
                0
            )(`[ERROR]`)} ${chalk.white(typeof thing !== 'string' ? util.inspect(thing) : thing)}`,
            !args.length ? "" : args.map(a => typeof a !== 'string' ? util.inspect(a) : a).join(' ')
        );
        grafana.sendError(typeof thing !== 'string' ? util.inspect(thing) : thing).catch(() => { });
    }
    trace(thing, ...args) {
        _console.trace(
            `${chalk.blue.inverse(date())} ${chalk.inverse(`[TRACE]`)} ${chalk.white(
                typeof thing !== 'string' ? util.inspect(thing) : thing
            )}`,
            !args.length ? "" : args.map(a => typeof a !== 'string' ? util.inspect(a) : a).join(' ')
        );
        grafana.sendLog(typeof thing !== 'string' ? util.inspect(thing) : thing).catch(() => { });
    }
} Logger
module.exports = (logLevel) => global.console = new Logger(logLevel);
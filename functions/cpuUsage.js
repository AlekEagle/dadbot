'use strict';

// Use os.cpus times as the total elapsed time
const os = require('os');

let cpus = os.cpus();
let startUsage = process.cpuUsage()



function _totalCpuTime(cpu) {
    // millis
    if (!cpu || !cpu.times) return 0;
    const { user, nice, sys, idle, irq } = cpu.times;

    return user + nice + sys + idle + irq;
}

function totalCpusTime(cpus) {
    return cpus.map(_totalCpuTime).reduce((a, b) => a + b, 0);
}

module.exports = () => {
    let newCpus = os.cpus();
    let newStartUsage = process.cpuUsage();

    let elapCpuTimeMs = totalCpusTime(newCpus) - totalCpusTime(cpus);
    let elapUsage = process.cpuUsage(startUsage)

    cpus = newCpus;
    startUsage = newStartUsage;

    let elapUserMS = elapUsage.user / 1000; // microseconds to milliseconds
    let elapSystMS = elapUsage.system / 1000;
    let cpuPercent = Number((100 * (elapUserMS + elapSystMS) / elapCpuTimeMs).toFixed(0))

    return cpuPercent === Infinity ? 0 : cpuPercent;
};
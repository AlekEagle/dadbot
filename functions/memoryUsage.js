'use strict';

class KiloBytes {
    raw() {
        return process.memoryUsage().rss / 1024;
    }
    
    stringify() {
        let mem = process.memoryUsage().rss / 1024;
        return `${mem.toString().slice(0,mem.toString().indexOf('.') !== -1 ? mem.toString().indexOf('.') + 3 : mem.toString().length)}KB`;
    }
}

class MegaBytes {
    raw() {
        return process.memoryUsage().rss / 1024 / 1024;
    }
    
    stringify() {
        let mem = process.memoryUsage().rss / 1024 / 1024;
        return `${mem.toString().slice(0,mem.toString().indexOf('.') !== -1 ? mem.toString().indexOf('.') + 3 : mem.toString().length)}MB`;
    }
}

class GigaBytes {
    raw() {
        return process.memoryUsage().rss / 1024 / 1024 / 1024;
    }
    
    stringify() {
        let mem = process.memoryUsage().rss / 1024 / 1024 / 1024;
        return `${mem.toString().slice(0,mem.toString().indexOf('.') !== -1 ? mem.toString().indexOf('.') + 3 : mem.toString().length)}GB`;
    }
}

class TeraBytes {
    raw() {
        return process.memoryUsage().rss / 1024 / 1024 / 1024 / 1024;
    }
    
    stringify() {
        let mem = process.memoryUsage().rss / 1024 / 1024 / 1024 / 1024;
        return `${mem.toString().slice(0,mem.toString().indexOf('.') !== -1 ? mem.toString().indexOf('.') + 3 : mem.toString().length)}TB`;
    }
}

module.exports = (omem) => {
    let mem = omem || process.memoryUsage().rss;
    if((mem / 1024 / 1024 / 1024) > 1024) return `${(mem / 1024 / 1024 / 1024 / 1024).toString().slice(0, (mem / 1024 / 1024 / 1024 / 1024).toString().indexOf('.') + 3)}TB`;
    else if ((mem / 1024 / 1024) > 1024) return `${(mem / 1024 / 1024 / 1024).toString().slice(0, (mem / 1024 / 1024 / 1024).toString().indexOf('.') + 3)}GB`;
    else if ((mem / 1024) > 1024) return `${(mem / 1024 / 1024).toString().slice(0, (mem / 1024 / 1024).toString().indexOf('.') + 3)}MB`;
    else if (mem > 1024) return `${(mem / 1024).toString().slice(0, (mem / 1024).toString().indexOf('.') + 3)}KB`;
    else return `${mem}B`;
}


module.exports.KiloBytes = KiloBytes;
module.exports.MegaBytes = MegaBytes;
module.exports.GigaBytes = GigaBytes;
module.exports.TeraBytes = TeraBytes;
module.exports.KB = module.exports.KiloBytes;
module.exports.MB = module.exports.MegaBytes;
module.exports.GB = module.exports.GigaBytes;
module.exports.TB = module.exports.TeraBytes;
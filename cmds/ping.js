'use strict';


module.exports = {
    name: 'ping',

    exec: (client, msg, args) => {
            var apiPingTime = client.shards.map(s => s.latency);
            const then = Date.now();
            client.createMessage(msg.channel.id, 'Pinging...').then((message) => {
                client.editMessage(msg.channel.id, message.id, 'Pong!\nMessage edit time: ' + (Date.now() - then) + 'ms\nAPI ping time: ' + apiPingTime + 'ms')
            })
        
    },

    options: {
        description: 'API response time',
        fullDescription: 'it will pong'
    }
}
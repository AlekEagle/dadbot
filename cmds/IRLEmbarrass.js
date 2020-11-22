'use strict';

module.exports = {
    name: 'irlembarrass',

    exec: (client, msg, args) => {
        if (msg.attachments[0] === undefined) msg.channel.createMessage('Please send a picture of your face! We use this to help generate a clone of you to say the embarrassing thing! (note: We never store the pictures on our servers!)');
        else {
            msg.channel.createMessage('Alright! Generating your clone... <a:loading1:470030932775272469>').then(message => {
                setTimeout(() => {
                    message.edit(`Clone Generated! Your clone should arrive at your location in ${Math.floor(Math.random() * 30)} minutes!`);
                }, 15000);
            })
        }
    }
}
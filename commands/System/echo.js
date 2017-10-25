const { Command } = require('klasa');

module.exports = class extends Command {

    constructor(...args) {
        super(...args, {
            aliases: ['talk'],
            permLevel: 10,

            usage: '[channel:channel] [message:string] [...]',
            usageDelim: ' ',
            description: 'Make KozalakBot talk in another channel.'
        });
    }

    async run(msg, [channel = msg.channel, ...content]) {
        if (msg.deletable) msg.delete().catch(() => null);

        const attachment = msg.attachments.size > 0 ? msg.attachments.first().url : null;
        content = content.length ? content.join(' ') : '';

        if (content.length === 0 && !attachment) throw 'K olmayan şeyi göndermemi bekliyorsun. Afferin sana.';

        const options = {};
        if (attachment) options.files = [{ attachment }];

        return channel.send(content, options);
    }

};

const { Command } = require('klasa');
const { showSeconds } = require('../../lib/utils');

module.exports = class extends Command {

    constructor(...args) {
        super(...args, {
            runIn: ['text'],
            enabled: true,
            description: 'Sırayı gösteren muhterem komut.'
        });
    }

    async run(msg) {
        const { next, queue, autoplay } = msg.guild.music;
        const output = [];
        for (let i = 0; i < Math.min(queue.length, 10); i++) {
            output[i] = [
                `[__\`${String(i + 1).padStart(2, 0)}\`__] *${queue[i].title.replace(/\*/g, '\\*')}* ekleyen **${queue[i].requester.tag || queue[i].requester}**`,
                `   └── <${queue[i].url}> (${showSeconds(queue[i].seconds * 1000)})`
            ].join('\n');
        }
        if (queue.length > 10) output.push(`${queue.length} taneden 10 tanesi gösteriliyor..`);
        else if (autoplay) output.push(`\n**AutoPlay**: <${next}>`);
        const embed = new this.client.methods.Embed().author("Sıradaki müzikler.", this.client.user.avatarURL()).setDescription(output.join('\n'));
        return msg.send({embed});
    }

};

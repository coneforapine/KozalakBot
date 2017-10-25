const { Inhibitor } = require('klasa');

module.exports = class extends Inhibitor {

    constructor(...args) {
        super(...args, { spamProtection: true });
    }

    async run(msg, cmd) {
        if (cmd.requireMusic !== true) return;

        if (msg.channel.type !== 'text') throw 'Dm veya grup kanllarında bu komutu giremezsin..';

        if (!msg.member.voiceChannel) throw 'Bir ses kanalında değilsin..';
        if (!msg.guild.me.voiceChannel) throw 'Kanka bir ses kanalında değilim...';
        if (msg.member.voiceChannel.id !== msg.guild.me.voiceChannel.id) throw 'Benimle aynı ses kanalında değilsin, arkadaşlarının yanına git. xD';
    }

};

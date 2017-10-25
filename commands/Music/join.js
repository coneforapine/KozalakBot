const { Command } = require('klasa');

module.exports = class extends Command {

    constructor(...args) {
        super(...args, {
            runIn: ['text'],
            aliases: ['connect'],

            description: 'Başka yol düşünemediğimden böyle bir manyaklık yapayım dedim.. Sonuç? Join komnutu..'
        });
    }

    async run(msg) {
        if(msg.guild.me.voiceChannel) return;
        const { voiceChannel } = msg.member;
        if (!voiceChannel) throw 'Bir ses kanalında değilsin falan filan...';
        this.resolvePermissions(msg, voiceChannel);

        const { music } = msg.guild;
        await music.join(voiceChannel);

        return null;
    }

    resolvePermissions(msg, voiceChannel) {
        const permissions = voiceChannel.permissionsFor(msg.guild.me);

        if (permissions.has('CONNECT') === false) throw 'Welp, birisi bana ses kanallarına bağlanma yetkisi verebilir mi?';
        if (permissions.has('SPEAK') === false) throw 'Müzik çalmam için konuşmam gerekiyor.. Değil mi? Yada şarkı mı söylüyorum bilmiyorum..';
    }
};

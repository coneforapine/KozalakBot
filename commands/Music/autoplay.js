const { Command } = require('klasa');

module.exports = class extends Command {

    constructor(...args) {
        super(...args, {
            runIn: ['text'],

            description: 'Otomatik oynatmayı açıp kapatır. -Sanırım hayatımdaki en büyük başarı falandı filandı...-',
            extendedHelp: `Bu komut sadece otomatik oynatmayı açıp kapatır! Sadece canınız çok sıkkınken kullanın falandı filandı.`
        });

        this.requireMusic = true;
    }

    async run(msg) {
        const { music } = msg.guild;
        const enabled = music.autoplay === false;

        music.autoplay = enabled;

        return msg.send(`Otomatik oynatmayı ${enabled ? 'açtım.' : 'kapattım.'}. Başka bir arzunuz?`);
    }

};

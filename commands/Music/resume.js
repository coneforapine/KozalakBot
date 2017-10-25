const { Command } = require('klasa');

module.exports = class extends Command {

    constructor(...args) {
        super(...args, {
            runIn: ['text'],

            description: 'Şimdiki şarkıyı çalmaya devam eder.'
        });

        this.requireMusic = true;
    }

    async run(msg) {
        const { music } = msg.guild;
        const badbed = new this.client.methods.Embed().setAuthor("Pü pü gençliğe bak gençlik bitmiş", this.client.user.avatarURL).setDescription("Gençlik durdurmadığını çalmaya çalışıyor..").setColor("#FF4444");
        if (music.status === 'playing') msg.channel.send({embed: badbed});
        music.pause();
        const godbed = new this.client.methods.Embed().setAuthor("Tamamdır kanka", this.client.user.avatarURL).setDescription("Oynatıyorum tamam tamam");
        return msg.channel.send({embed: godbed});
    }
};

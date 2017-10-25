const { Command } = require('klasa');

module.exports = class extends Command {

    constructor(...args) {
        super(...args, {
            runIn: ['text'],            
            description: 'Stop.'
        });

        this.requireMusic = true;
    }

    async run(msg) {
        const { music } = msg.guild;
        await music.destroy();
        const stop = new this.client.methods.Embed().setAuthor("Tamamdır kanka", this.client.user.avatarURL()).setDescription("Başarıyla durdurdum ve ses kanalından çıktım.").setColor("#20B2AA");
        return msg.channel.send({embed: stop});
    }

};

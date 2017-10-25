const { Command } = require('klasa');

module.exports = class extends Command{
    constructor(...args) {
        super(...args, {
            aliases: ['invite'],
            description: 'Davet linki oluşturur.'
        });
    }
    async run(msg) {
        const embed = new this.client.methods.Embed().setAuthor("KozalakBot Davet Linki", this.client.user.avatarURL()).setDescription("KozalakBot'u Discord'unuza davet etmek için:\n[bu linke tıklayınız..](https://discordapp.com/oauth2/authorize?client_id=319755031274455040&permissions=35840&scope=bot)\n\nLink bot için gereken minimum yetkilere sahip şekilde oluşturulmuştur. İlerideki güncellemelerde yeni yetkiler istenirse size bildereceğim.").setFooter("KozalakBot | Bolca kahve ve eski kıçıkırık bir bilgisayarla yazılmıştır.").setTimestamp().setColor('#20B2AA');
        msg.channel.send({embed});
        
    }
};

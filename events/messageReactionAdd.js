const { Event } = require('klasa');

module.exports = class extends Event {

    constructor(...args) {
        super(...args, { 
            enabled: true
        });
    }

    async run(messageReaction, user) {
        if(messageReaction.emoji.name === "⭐") {
            const msg = messageReaction.message;
            if(!msg.guild.settings.starboard) return msg.channel.send('Starboard bulamadım ki.. Adminlerden birinin ayarlaması gerekiyor.');
            const starboard = await this.client.channels.get(msg.guild.settings.starboard);
            
            const embed = new this.client.methods.Embed()
            .setAuthor(`${user.tag}, yıldızladı`, user.avatarURL())
            .setTitle(`Bu mesaj ${messageReaction.count} kere yıldızlandı.`)
            .setDescription(`${msg.content}`);

            starboard.send({embed});

        }
        
    }

    async init() {
        //if(!this.client.guildData.stars) await this.client.guildData.add('stars', {type: "String", array: true});
    }

};

const { Command } = require('klasa');
module.exports = class extends Command {

    constructor(...args) {
        super(...args, {
            enabled: true,
            runIn: ['text', 'dm', 'group'],
            cooldown: 0,
            aliases: [],
            permLevel: 6,
            botPerms: [],
            requiredSettings: [],
            description: '',
            usage: '<usr:user> <reason:str>[...]',
            usageDelim: ' ',
            extendedHelp: 'No extended help available.'
        });
        this.db = this.client.providers.get('mongodb');
    }

    async run(msg, [usr, ...reason]) {
        msg.guild.moderation.warn(usr, reason.join(" "), msg.member).then(result => {
            const usrbed = new this.client.methods.Embed()
            .setAuthor(`Bir uyarı aldınız.`, this.client.user.avatarURL())
            .setColor("RANDOM")
            .setDescription(`${msg.member} sizi "${reason.join(" ")}" sebebiyle uyardı. Bu sebeple tam ${result.points} ceza puanı aldınız.`)
            .setFooter("1000 ceza puanında işler ciddiye binmeye başlayacak haberin olsun. Ehe.");
            usr.send({ embed: usrbed }).catch(msg.channel.send("DM'leri kapalı, çok yazık yakında banlanır sanırım."));

            const logbed = new this.client.methods.Embed()
            .setAuthor(`${msg.member.displayName}`, msg.author.avatarURL())
            .setDescription(`**Eylem:** ${result.action}\n**Sebep:** ${result.reason}\n**Ceza Puanı:** ${result.points}`)
            .setTimestamp()
            .setColor("RANDOM");

            if (msg.guild.settings.modlog) return msg.guild.channels.get(msg.guild.settings.modlog).send({ embed: logbed });

            return msg.channel.send({ embed: logbed });
        });
    }

};

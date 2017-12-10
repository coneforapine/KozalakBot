const { Command } = require('klasa');

module.exports = class extends Command {

    constructor(...args) {
        super(...args, {
            enabled: true,
            runIn: ['text'],
            cooldown: 0,
            aliases: [],
            permLevel: 6,
            botPerms: [],
            requiredSettings: [],
            description: 'Gets all cases for specific user',
            usage: '<user:user>',
            usageDelim: ' ',
            extendedHelp: 'No extended help available.'
        });
    }

    async run(msg, user) {
        const cases = await msg.guild.moderation.getUserCases(user[0].id);
        if (cases.length === 0) return msg.channel.send("Bu kullanıcının sicili boş bir defterden daha temiz.");
        const embed = new this.client.methods.Embed()
        .setAuthor(user[0].avatarURL(), `${user[0].username} için `)
        .setDescription(cases.map(c => `**ID:** ${c.id} **Eylem**: ${c.action}`).join("\n"))
        .setTimestamp()
        .setFooter(`${msg.member.username} tarafından istendi.`);
        msg.channel.send({ embed });
    }

};

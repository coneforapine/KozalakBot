const { Command } = require('klasa');

module.exports = class extends Command {

    constructor(...args) {
        super(...args, {
            enabled: true,
            runIn: ['text'],
            cooldown: 0,
            aliases: [],
            permLevel: 7,
            name: 'config',
            description: 'Çeşitli ayarları değiştirmenizi sağlar.',
            usage: '<set|get|reset|list|remove> [key:string] [value:string]'
        });
    }

    async run(msg, [action, key, ...value]) {
        const configs = msg.guild.settings;
		if (action !== 'list' && !key) throw msg.language.get('COMMAND_CONF_NOKEY');
		if (['set', 'remove'].includes(action) && !value[0]) throw msg.language.get('COMMAND_CONF_NOVALUE');
		if (['set', 'remove', 'reset'].includes(action) && !configs.id) await this.client.settings.guilds.create(msg.guild);
		if (['set', 'remove', 'get', 'reset'].includes(action) && !(key in configs)) throw msg.language.get('COMMAND_CONF_GET_NOEXT', key);
		await this[action](msg, configs, key, value);
    }
    
    async list(msg, configs) {
        const embed = new this.client.methods.Embed()
        .setAuthor(`${msg.guild.name} için ayarlar.`, this.client.user.avatarURL())
        .addField(`Prefix:`, `${configs.prefix}`, )
        //.addField(`Kapatılan komutlar:`, `${configs.disabledcommands.join(' ')}`, true)
        .addField(`Modlog:`, `${configs.modlog ? '<#' + configs.modlog +'>' : 'Bu ayar için herhangi bir değer yok.'}`, true) //eslint-disable-line prefer-template
        .addField(`Starboard`, `${configs.starboard ? '<#' + configs.starboard + '>' : 'Bu ayar için herhangi bir değer yok.'}`, true) //eslint-disable-line prefer-template
        .setColor("#20B2AA")
        .setTimestamp()
        .setFooter('Kozalakbot | Bolca kahve ve kıçıkırık bir bilgisayar ile yapıldı.');
		return msg.channel.send({embed});
    }
    
    async init() {
        if (!this.client.settings.guilds.schema.modlog && this.client.settings.guilds.schema.starboard) {
          await this.client.settings.guilds.add("modlog", { type: "TextChannel" });
          await this.client.settings.guilds.add('starboard', {type: "TextChannel"});
        }
    }

};

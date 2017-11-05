const { Command } = require('klasa');
const { inspect } = require('util');

module.exports = class extends Command {

    constructor(...args) {
        super(...args, {
            enabled: true,
            runIn: ['text'],
            cooldown: 0,
            aliases: [],
            permLevel: 6,
            name: 'config',
            description: 'Çeşitli ayarları değiştirmenizi sağlar.',
            usage: '<set|get|reset|list|remove> [key:string] [value:string]',
            usageDelim: ' '
        });
    }

    async run(msg, [action, key, ...value]) {
		const configs = msg.guild.settings;
		if (action !== 'list' && !key) throw 'Neyi değiştirmem gerketiğini söylemedin...';
		if (['set', 'remove'].includes(action) && !value[0]) throw 'Değiştirmem gereken değer eksik.';
		if (['set', 'remove', 'reset'].includes(action) && !configs.id) await this.client.settings.guilds.create(msg.guild);
		if (['set', 'remove', 'get', 'reset'].includes(action) && !(key in configs)) throw 'Değiştirmeye çalıştığın şey hiç varolmamış gibi.';
		await this[action](msg, configs, key, value);
		return null;
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

    async get(msg, configs, key) {
		return msg.sendMessage(`${key} için şu anki ayar ${configs[key]}`);
    }

    async set(msg, configs, key, value) {
		if (this.client.settings.guilds.schema[key].array) {
			await this.client.settings.guilds.updateArray(msg.guild, 'add', key, value.join(' '));
			return msg.sendMessage(`${key}: ${value.join(' ')} olarak değiştirildi.`);
		}
		const response = await this.client.settings.guilds.update(msg.guild, { [key]: value.join(' ') });
		return msg.sendMessage(`${key}: ${response[key]} olarak değiştirildi.`);
    }
    
    async reset(msg, configs, key) {
		const response = await this.client.settings.guilds.reset(msg.guild, key);
		return msg.sendMessage(`${key}: sıfırlanarak ${response} haline değiştirildi.`);
    }
    
    async remove(msg, configs, key, value) {
		if (!this.client.settings.guilds.schema[key].array) return msg.sendMessage('Bu ayar dizi türünde değil, remove yerine reset kullanın.');
		return this.client.settings.guilds.updateArray(msg.guild, 'remove', key, value.join(' '))
			.then(() => msg.sendMessage(`${key} başarıyla kaldırıldı.`))
			.catch(err => msg.sendMessage(err));
	}
    
    async init() {
        if (!this.client.settings.guilds.schema.modlog && this.client.settings.guilds.schema.starboard) {
          await this.client.settings.guilds.add("modlog", { type: "TextChannel" });
          await this.client.settings.guilds.add('starboard', {type: "TextChannel"});
        }
    }

};

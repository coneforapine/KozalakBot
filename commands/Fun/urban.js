const { Command } = require('klasa');
const snekfetch = require('snekfetch');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			description: 'Searches the Urban Dictionary library for a definition to the search term.',
			usage: '<search:str> [resultNum:int]'
		});
	}

	async run(msg, [search, index = 1]) {
		const body = await snekfetch.get(`http://api.urbandictionary.com/v0/define?term=${encodeURIComponent(search)}`)
			.then(data => JSON.parse(data.text));

        const def = this.getDefinition(search, body, --index);
        const embed = new this.client.methods.Embed().setAuthor(`${def.word} için arama sonucu`, msg.author.avatarURL()).setDescription(`Definition:\n${def.definition}\n${def.example ? "Example:\n" + def.example : ""}
        \n[Permalink](${def.permalink})`).setColor("#FF2244").setTimestamp();
		return msg.channel.send({embed: embed});
	}

	getDefinition(search, body, index) {
		const result = body.list[index];
		if (!result) throw 'Hiç bir şey bulamadım...';

		const wdef = result.definition.length > 1000 ?
			`${this.splitText(result.definition, 1000)}...` :
			result.definition;

		return {
			word: search,
			definition: `** ${++index} out of ${body.list.length}**\n_${wdef}_`,
			example: result.example ? result.example : undefined,
			permalink: result.permalink
        };
	}

	splitText(string, length, endBy = ' ') {
		const a = string.substring(0, length).lastIndexOf(endBy);
		const pos = a === -1 ? length : a;
		return string.substring(0, pos);
	}

};
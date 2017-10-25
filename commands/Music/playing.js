const { Command } = require('klasa');
const { splitText, showSeconds } = require('../../lib/utils');
const getInfo = require('util').promisify(require('ytdl-core').getInfo);

module.exports = class extends Command {

    constructor(...args) {
        super(...args, {
            runIn: ['text'],

            description: 'Şu an çalan şarkıyı gösterir.'
        });
    }

    async run(msg) {
        const { dispatcher, queue, status } = msg.guild.music;
        if (status !== 'playing') throw `Şu anda bir şey çalmıyorum.`;
        const song = queue[0];
        const info = await getInfo(song.url).catch((err) => { throw err; });
        if (!info.author) info.author = {};
        const embed = new this.client.methods.Embed()
            .setColor(12916736)
            .setTitle(info.title)
            .setURL(`https://youtu.be/${info.vid}`)
            .setAuthor(info.author.name || 'Unknown', info.author.avatar || null, info.author.channel_url || null)
            .setDescription([
                `**Süre**: ${showSeconds(parseInt(info.length_seconds) * 1000)} [Kalan zaman: ${showSeconds((parseInt(info.length_seconds) * 1000) - dispatcher.time)}]`,
                `**Açıklama**: ${splitText(info.description, 500)}`
            ].join('\n\n'))
            .setThumbnail(info.thumbnail_url)
            .setTimestamp();
        return msg.send({ embed });
    }

};

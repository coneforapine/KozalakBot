const ytdl = require('ytdl-core');
const getInfoAsync = require('util').promisify(ytdl.getInfo);
const search = require('util').promisify(require("youtube-search"));
const { ytkey } = require("../config.json");

module.exports = class InterfaceMusic {

    constructor(guild) {
        Object.defineProperty(this, 'client', { value: guild.client });
        Object.defineProperty(this, 'guild', { value: guild });
        this.recentlyPlayed = new Array(10);
        this.queue = [];
        this.channel = null;

        this.dispatcher = null;

        this.autoplay = false;
        this.next = null;

        this.status = 'idle';
    }

    async add(user, url) {
        const song = await getInfoAsync(url).catch((err) => {
            this.client.emit('log', err, 'error');
            throw `err`;
        });

        const metadata = {
            url: `https://youtu.be/${song.video_id}`,
            title: song.title,
            channel: song.author.name,
            requester: user,
            loudness: song.loudness,
            seconds: song.length_seconds
        };

        this.queue.push(metadata);

        this.next = this.getLink(song.related_videos);

        return metadata;
    }

    getLink(playlist) {
        for (const song of playlist) {
            if (!song.id || this.recentlyPlayed.includes(`https://youtu.be/${song.id}`)) continue;
            return `https://youtu.be/${song.id}`;
        }
        return null;
    }

    async searcher(query) {
        if(!query) throw "You must give me the damn query.";
        return search(query, {maxResults: 10, key: ytkey});
    }

    join(voiceChannel) {
        return voiceChannel.join()
            .catch((err) => {
                if (String(err).includes('ECONNRESET')) throw 'Ses kanalına bağlanırken bir hata oluştu.';
                this.client.emit('log', err, 'error');
                throw err;
            });
    }

    async leave() {
        if (!this.voiceChannel) throw 'Herhangi bir ses kanalında değilim... Olmadığım ses kanalından ayrılmamı bekleme benden.. Lütfen.';
        this.dispatcher = null;
        this.status = 'idle';

        await this.voiceChannel.leave();
        return this;
    }

    async play() {
        if (!this.voiceChannel) throw 'Ses kanalında değilim.';
        else if (!this.connection) throw 'Bağlantı bulamadım.. Rip';
        else if (!this.queue[0]) throw 'Sırada hiç şarkı yok ki.. Bir şeyler eklemeyi dene.';

        this.pushPlayed(this.queue[0].url);

        const stream = ytdl(this.queue[0].url)
            .on('error', err => this.client.emit('log', err, 'error'));

        this.dispatcher = this.connection.playStream(stream, { passes: 5 });
        return this.dispatcher;
    }

    pushPlayed(url) {
        this.recentlyPlayed.push(url);
        this.recentlyPlayed.shift();
    }

    pause() {
        this.dispatcher.pause();
        this.status = 'paused';
        return this;
    }

    resume() {
        this.dispatcher.resume();
        this.status = 'playing';
        return this;
    }

    skip(force = false) {
        if (force && this.dispatcher) this.dispatcher.end();
        else this.queue.shift();
        return this;
    }

    prune() {
        this.queue = [];
        return this;
    }
    
    async destroy() {
        if (this.voiceChannel) await this.voiceChannel.leave();

        this.recentlyPlayed = null;
        this.dispatcher = null;
        this.status = null;
        this.queue = null;
        this.autoplay = null;
        this.next = null;

        this.client.queue.delete(this.guild.id);
    }

    get voiceChannel() {
        return this.guild.me.voiceChannel;
    }

    get connection() {
        return this.voiceChannel ? this.voiceChannel.connection : null;
    }

};

const { Command } = require('klasa');
// const Lyricist = require("lyricist");
// const lyricist = new Lyricist("hDBtKpcjlMlOFV0efckp1htm71dw9Oj61rblvZGdUeY5U4ZIK8xyPuzaM64_uO7Z");
// Eat Shit Genius.
module.exports = class extends Command {

    constructor(...args) {
        super(...args, {
            runIn: ['text'],
            description: 'The great play command',
            usage: '<song:string>'
        });

        this.delayer = time => new Promise(res => setTimeout(() => res(), time));
    }
    async run(msg, [...song]) {
        const regExpe = /^(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/\S*(?:(?:\/e(?:mbed)?)?\/|watch\/?\?(?:\S*?&?v=))|youtu\.be\/)([\w-]{11})(?:[^\w-]|$)/;
        const musicInterface = msg.guild.music;
        const id = regExpe.exec(song);

        const errbed = new this.client.methods.Embed().setAuthor('Komutan Logar!', this.client.user.avatarURL())
        .setColor('#FF4444')
        .setDescription("Link veya arama sorgusu vermeyi unuttunuz efendim.");
        const playingbed = new this.client.methods.Embed().setColor('#20B2AA');

        if (!song) return msg.channel.send({ embed: errbed });

        if (!musicInterface.dispatcher || !musicInterface.voiceChannel) await this.join(msg);
        if (musicInterface.status === 'paused') await this.client.commands.get('resume').run(msg);

        if (id) {
            if (musicInterface.status === 'playing') return await this.add(msg, id[1]);
            await this.add.run(msg, id[1]);
            musicInterface.status = 'playing';
            musicInterface.channel = msg.channel;
            return this.play(musicInterface);
        }

        const searchres = await musicInterface.searcher(song);
        playingbed.setAuthor('Arama sonuçları.. NANIII!?', this.client.user.avatarURL())
        .setDescription(searchres.map((a, i) => `${i + 1} *${a.title}* by **${a.channelTitle}**`).join('\n'))
        .setFooter("Seçmek için sadece numarayı girmen yeterli.. Sonrası içkiliydi bilmem neye düşmesin ama.");
        const collector = msg.channel.createMessageCollector(m => m.author.id === msg.author.id && m.channel.id === msg.channel.id, { time: 30000 });
        msg.channel.send({ embed: playingbed });
        collector.on('collect', async collected => {
            const selection = parseInt(collected) - 1;
            // temp debug line.
            if (selection > 0 || selection < 10) {
                if (musicInterface.status === 'playing') {
                    this.add(msg, searchres[selection].id);
                    return collector.stop();
                }
                await this.add(msg, searchres[selection].id);
                musicInterface.status = 'playing';
                musicInterface.channel = msg.channel;
                this.play(musicInterface);
                return collector.stop();
            } else {
                await musicInterface.leave();
                msg.channel.send("Sadece `1` ve `10` arasında sayı vermen gerekiyordu...");
                return collector.stop();
            }
        }).on('end', collected => {
            if (collected.size < 1) return msg.channel.send(":ok_hand: Bir şey çalmak istemiyorsan sorun değil, ama beni rahatsız etme :3.");
        });
    }

    async play(musicInterface) {
        if (musicInterface.status !== 'playing') return null;

        const song = musicInterface.queue[0];

        if (!song) {
            if (musicInterface.autoplay) return this.autoPlayer(musicInterface).then(() => this.play(musicInterface));
            return musicInterface.channel.send('Sırada hiç şarkı kalmadı bea..').then(() => musicInterface.destroy());
        }
        // const playingMessage = due to lyrics api its removed.
        await musicInterface.channel.send({
 embed: {
            author: {
                name: "Şimdi oynatılıyor",
                icon_url: this.client.user.avatarURL()
            },
            description: `Video Adı: **${song.title}**\n Sahibi: **${song.channel}**\n Uzunluğu: **${this.timeconvert(song.seconds)}**\n Ekleyen: **${song.requester}**`,
            color: 2142890,
            footer: { text: "KozalakBot | Bolca kahve ve eski kıçıkırık bir bilgisayarla yapıldı." }
        }
 });
        // Removed until find a *goood* lyrics api
        /* playingMessage.react("🔉");
        const collector = playingMessage.createReactionCollector(
            (reaction) => reaction.emoji.name === "🔉", {time : song.seconds}
        ).on('collect', async r => {
            lyricist.search(song.title).then(async songid => {
                const lyrics = await lyricist.song(songid[0].id, {fetchLyrics: true});
                const ly = lyrics.lyrics.slice(0, 1000);
                const ls = lyrics.lyrics.slice(1000, 2000);
                if(lyrics.lyrics.indexOf('[Don\'t see your favourite band? Add them yourself!]') !== -1) {
                    await musicInterface.channel.send("Şarkı için söz bulunamadı.");
                    return collector.stop();
                }
                await musicInterface.channel.send(`\`\`\`${ly}\`\`\``);
                if(ls) await musicInterface.channel.send(`\`\`\`${ls}\`\`\``);
                collector.stop();
            });
        });*/

        await this.delayer(300);

        return musicInterface.play()
            .then(
                (dispatcher) => dispatcher
                    .on('end', () => {
                        musicInterface.skip();
                        this.play(musicInterface);
                    })
                    .on('error', (err) => {
                        musicInterface.channel.send('Yüce honos aşkına, bir hata oluştu.');
                        musicInterface.client.emit('log', err, 'error');
                        musicInterface.skip();
                        this.play(musicInterface);
                    }),
            );
    }
    timeconvert(time) {
        const minutes = Math.floor(time / 60);
        const seconds = time - minutes * 60;
        return `${minutes}:${seconds}`;
    }

    autoPlayer(musicInterface) {
        return musicInterface.add('YouTube AutoPlay', musicInterface.next);
    }
    async add(msg, id) {
        const rid = /^[a-zA-Z0-9-_]{11}$/.exec(id);
        if (!rid) throw "Err";
        const { music } = msg.guild;
        const url = `http://youtu.be/${rid[0]}`;
        if (music.status === 'idle') {
            await music.add(msg.author, url);
            return;
        }
        // hiç bir şey yokken sadece ilk mesajı göndermesi yeterli.

        const song = await music.add(msg.author, url);
        const playingbed = new this.client.methods.Embed().setAuthor("Müzik Sıraya eklendi", this.client.user.avatarURL())
        .setColor('#20B2AA').setFooter('KozalakBot | Bolca kahve ve eski kıçıkırık bir bilgisayarla yapıldı.')
        .setDescription(`Video Adı: **${song.title}**\nSahibi: **${song.channel}**\nUzunluğu: **${this.timeconvert(song.seconds)}**\nEkleyen: **${msg.member.displayName}**`);
        return msg.channel.send({ embed: playingbed });
    }

    async join(msg) {
        if (msg.guild.me.voiceChannel) return;
        const { voiceChannel } = msg.member;
        if (!voiceChannel) throw 'Bir ses kanalında değilsin falan filan...';
        this.resolvePermissions(msg, voiceChannel);

        const { music } = msg.guild;
        await music.join(voiceChannel);

        return null;
    }

    resolvePermissions(msg, voiceChannel) {
        const permissions = voiceChannel.permissionsFor(msg.guild.me);

        if (permissions.has('CONNECT') === false) throw 'Welp, birisi bana ses kanallarına bağlanma yetkisi verebilir mi?';
        if (permissions.has('SPEAK') === false) throw 'Müzik çalmam için konuşmam gerekiyor.. Değil mi? Yada şarkı mı söylüyorum bilmiyorum..';
    }

};

const { Command } = require('klasa');
const { Canvas } = require('canvas-constructor');

const snek = require('snekfetch');
const fsn = require('fs-nextra');

module.exports = class extends Command {
    constructor(...args) {
        super(...args, {
            aliases: ['batman'],
            description: 'Slap another user as Batman.',
            usage: '<slappedMember:member>',
            extendedHelp: 'Mention another user to slap them. AND BE BATMAN.',
            botPerms: ['ATTACH_FILES'],
            colldown: 60000
        });
    }
    async run(msg, [slappedMember]) {
        const slapped = slappedMember.user;
        const slapper = msg.author;
        if(slapped.id === slapper.id) return msg.channel.send("Kendini tokatlamayı kes, kendini tokatlamayı kes, kendini tokatlamayı kes...");
        const loadingMsg = await msg.channel.send(`${slappedMember.displayName} aranıyor...`);

        const res = await this.slapper(slapper.displayAvatarURL({format: 'png'}), slapped.displayAvatarURL({format: 'png'}));
        loadingMsg.delete();
        if(slapper.id)
        return msg.channel.send({files: [{attachment: res, name:'slapped.png'}]});
    }
    async slapper(slapper, slapped) {
        const batman = await fsn.readFile(`${this.client.clientBaseDir}/assests/imageSlap.png`);
        const slapperP = slapper.replace(/\.gif.+/g, '.png');
        const slappedP = slapped.replace(/\.gif.+/g, '.png');
        const slappedBody = await snek.get(slappedP);
        const slapperBody = await snek.get(slapperP);  

        return new Canvas(950, 475)
        .addImage(batman, 0, 0, 950, 475)
        .addImage(slapperBody.body, 410, 107, 131, 131, { type: 'round', radius: 66 })
        .restore()
        .addImage(slappedBody.body, 159, 180, 169, 169, { type: 'round', radius: 85 })
        .restore()
        .toBuffer();
    }
};

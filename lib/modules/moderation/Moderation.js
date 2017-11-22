const Discord = require('discord.js');
const ModerationManager = require('./ModerationManager');

module.exports = class ModerationInterface extends Discord.Collection {

    constructor(client) {
        super();

        Object.defineProperty(this, 'client', { value: client });
    }

    async create(guild, db) {
        if (guild.constructor.name !== 'Guild') throw 'The parameter \'Guild\' must be a guild instance.';
        const manager = new ModerationManager(guild);
        super.set(guild.id, manager);
        if (!await db.hasTable("guildData")) {
            await db.createTable("guildData");
            await db.create("guildData", guild.id, { cases: [], stars: {} });
        }
        return manager;
    }

};

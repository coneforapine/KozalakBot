const Discord = require('discord.js');
const ModerationManager = require('./ModerationManager');

module.exports = class ModerationInterface extends Discord.Collection {

    constructor(client) {
        super();
        Object.defineProperty(this, 'client', { value: client });
    }

    async create(guild, db) {
        if (guild.constructor.name !== 'Guild') throw 'The parameter \'Guild\' must be a guild instance.';
        if (!db.has("guildData", guild.id)) {
            const guildData = await db.get("guildData", guild.id);
            const manager = new ModerationManager(guild, guildData);
            super.set(guild.id, manager);
            return manager;
        }
        const newData = await db.create("guildData", guild.id, { cases: [], stars: {} });
        const manager = new ModerationManager(guild, newData);
        super.set(guild.id, manager);
        return manager;
    }

};

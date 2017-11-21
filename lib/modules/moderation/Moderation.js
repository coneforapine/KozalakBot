const Discord = require('discord.js');
const ModerationManager = require('./ModerationManager');

module.exports = class ModerationInterface extends Discord.Collection {

    constructor(client) {
        super();

        Object.defineProperty(this, 'client', { value: client });
    }

    create(guild) {
        if (guild.constructor.name !== 'Guild') throw 'The parameter \'Guild\' must be a guild instance.';
        const manager = new ModerationManager(guild);
        super.set(guild.id, manager);
        return manager;
    }

};

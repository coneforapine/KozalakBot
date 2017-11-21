const moment = require('moment-duration-format');
module.exports = class InterfaceModeration {

        constructor(guild) {
            Object.defineProperty(this, 'client', { value: guild.client });
            Object.defineProperty(this, 'guild', { value: guild });

            this.db = this.client.providers.get("mongodb");

            if (!this.db.hasTable("guildData")) {
                this.db.createTable("guildData");
                this.db.create("guildData", guild.id, { cases: [], stars: {} });
            }
        }

        async addCase(action, user, reason) {
            const structure = {
                action: action,
                user: user,
                reason: reason, // eslint-disable-next-line
                timestamp: new Date.now() // todo: don't forget to use moment
            };

        }


    };


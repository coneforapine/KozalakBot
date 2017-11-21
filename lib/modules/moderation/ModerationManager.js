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
            this.cases = this.db.get("guildData", guild.id).cases;
        }

        async addCase(action, user, reason, day, points) {
            const currentGuild = await this.db.get("guildData", this.guild.id);
            const caseStructure = { // eslint-disable-next-line
                id: currentGuild.lenght + 1, 
                action: action,
                user: user,
                day: day ? day : null,
                points: points ? points : null,
                reason: reason, // eslint-disable-next-line
                timestamp: moment.duration(new Date.now()).format('D [gün], H [saat], m [dakika], s [saniye]')
            };
            currentGuild.cases.push(caseStructure);
            return await this.db.update("guildData", this.guild.id, currentGuild);
        }

        async ban(action, user, reason, day) {
            user.ban({ days: day, reason: reason });
            return await this.addCase(action, user, reason, day);
        }

        async kick(action, user, reason) {
            return await user.kick().then(this.addCase(action, user, reason));
        }

        async warn(action, user, reason, points = 100) {

        }

    };


const moment = require("moment");
module.exports = class InterfaceModeration {

        constructor(guild, currentGuild) {
            Object.defineProperty(this, 'client', { value: guild.client });
            Object.defineProperty(this, 'guild', { value: guild });

            this.db = this.client.providers.get("mongodb");
            this.currentGuild = currentGuild;
        }

        async addCase(action, user, reason, day, points, staffmember) {
            const caseStructure = { // eslint-disable-next-line
                id: this.currentGuild.cases.length + 1, 
                action,
                stuffmember: { id: staffmember.id, name: staffmember.displayName },
                user: { id: user.id, username: user.username },
                day,
                points,
                reason,
                timestamp: moment().toString()
            }; // I see, some assignments are too stupid for this beatiful code xd
            this.currentGuild.cases.push(caseStructure);
            await this.db.replace("guildData", this.guild.id, this.currentGuild);
            return caseStructure;
        }

        async ban(user, reason, days, staffmember) {
            user.ban({ days, reason }).then(this.addCase("Ban", user, reason, days, null, staffmember));
        }

        async kick(user, reason, staffmember) {
            return await user.kick().then(this.addCase("Kick", user, reason, null, null, staffmember));
        }

        async warn(user, reason, staffmember) {
            return this.addCase("Warn", user, reason, null, 100, staffmember);
            // each warn will add 100 points. After 1000 points things should be get serious. *TODO: make this shit guild configurable*
        }

        async getUserCases(id) {
            return this.currentGuild.cases.filter(c => c.user.id === id);
        }

    };

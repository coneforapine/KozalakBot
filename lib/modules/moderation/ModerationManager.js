module.exports = class InterfaceModeration {

        constructor(guild, currentGuild) {
            Object.defineProperty(this, 'client', { value: guild.client });
            Object.defineProperty(this, 'guild', { value: guild });

            this.db = this.client.providers.get("mongodb");
            this.currentGuild = currentGuild; // get data from mongo where you call constructor method.
        }

        async addCase(action, user, reason, day, points, staffmember) {
            const currentGuild = await this.db.get("guildData", this.guild.id); // and remove this stupid line after it done!
            const caseStructure = { // eslint-disable-next-line
                id: currentGuild.cases.length + 1, 
                action: action,
                stuffmember: staffmember,
                user: { id: user.id, username: user.nickname },
                day: day ? day : null,
                points: points ? points : null,
                reason: reason,
                timestamp: new Date()
            };
            currentGuild.cases.push(caseStructure);
            await this.db.replace("guildData", this.guild.id, currentGuild);
            return caseStructure;
        }

        async ban(user, reason, days, staffmember) {
            user.ban({ days, reason }).then(this.addCase("Ban", user, reason, days, null, staffmember));
        }

        async kick(user, reason) {
            return await user.kick().then(this.addCase("Kick", user, reason));
        }

        async warn(user, reason, points = 100, staffmember) {
            return this.addCase("Warn", user, reason, null, points, staffmember);
        }

        async getCases() {
            return await this.db.get("guildData", this.guild.id).cases;
        }

        async getUserCases(user) {
            return await this.db.get("guildData", this.guild.id).find("user", user.id); // aware of its not tested.
        }

        dummy() {
            return "Oh lel";
        }

    };

module.exports = class InterfaceModeration {

        constructor(guild) {
            Object.defineProperty(this, 'client', { value: guild.client });
            Object.defineProperty(this, 'guild', { value: guild });

            this.db = this.client.providers.get("mongodb");

            if (!this.db.hasTable("guildData")) {
                this.db.createTable("guildData");
                this.db.create("guildData", guild.id, { cases: [], stars: {} });
            }
            this.getCases();
        }

        async addCase(action, user, reason, day, points) {
            const currentGuild = await this.db.get("guildData", this.guild.id);
            const caseStructure = { // eslint-disable-next-line
                id: currentGuild.cases.length + 1, 
                action: action,
                user: { id: user.id, username: user.nickname },
                day: day ? day : null,
                points: points ? points : null,
                reason: reason,
                timestamp: new Date().toString
            };
            currentGuild.cases.push(caseStructure);
            await this.db.replace("guildData", this.guild.id, currentGuild);
            return currentGuild.cases;
        }

        async ban(user, reason, day) {
            user.ban({ days: day, reason });
            return await this.addCase("Ban", user, reason, day);
        }

        async kick(user, reason) {
            return await user.kick(reason).then(this.addCase("Kick", user, reason));
        }
        
        async warn(user, reason, points = 100) {
            return this.addCase("Warn", user, reason, null, points);
        }

        async getCases() {
            return await this.db.get("guildData", this.guild.id).cases;
        }

    };


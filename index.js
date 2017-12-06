const Client = require('./lib/Client');
const config = require('./config.json');

const KozalakBot = new Client({
    prefix: config.prefix,
    cmdEditing: true,
    provider: { engine: "mongodb" }
});

KozalakBot.login(config.token);
KozalakBot.once('ready', async () => {
    const db = KozalakBot.providers.get("mongodb");
    await db.init();
    if (!await db.hasTable("guildData")) {
        await db.createTable("guildData");
    }
    for (const guild of KozalakBot.guilds.values()) KozalakBot.queue.create(guild);
    for (const guild of KozalakBot.guilds.values()) KozalakBot.mod.create(guild, db);
});

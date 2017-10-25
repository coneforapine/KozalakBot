const Client = require('./lib/Client');
const config = require('./config.json');

const KozalakBot = new Client({
    prefix: config.prefix,
    cmdEditing: true
});

KozalakBot.login(config.token);
KozalakBot.once('ready', () => {
    for (const guild of KozalakBot.guilds.values()) KozalakBot.queue.create(guild);
});

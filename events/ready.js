const { Event } = require('klasa');

module.exports = class extends Event {

    run() {
        this.client.user.setPresence({game: 
            {
                name: 'KozalakBot'
            }
        });
    }

};

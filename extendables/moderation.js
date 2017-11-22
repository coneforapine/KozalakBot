const { Extendable } = require('klasa');

module.exports = class extends Extendable {

    constructor(...args) {
        super(...args, ['Guild']);
    }

    get extend() {
        const db = this.client.providers.get("mongodb");
        return this.client.mod.create(this, db);
    }

};

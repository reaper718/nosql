const mongodb = require('mongodb');
const { getDb } = require('../utils/database');

class Users {
    constructor(name, email, password) {
        this.name = name;
        this.email = email;
        this.password = password;
    }

    save() {
        const db = getDb();

        return db.collection('users').insertOne(this);
    }

    static findById(userId) {
        const db = getDb();

        return db.collection('users').find({_id: new mongodb.ObjectId(userId)}).next();
    }
}

module.exports = Users;
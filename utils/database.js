const mongodb = require('mongodb');
const MongoClient = mongodb.MongoClient;

let db;

const mongoConnect = callback => {
    MongoClient.connect('mongodb+srv://rudra:gPRJItKbI1MsM12i@cluster0.vxqdpak.mongodb.net/')
        .then(client => {
            console.log("Connnected to database");
            db = client.db();
            callback();
        })
        .catch(err => {
            console.log(err);
        })
}

const getDb = () => {
    if(db) {
        return db;
    }

    throw "No Database found!";
}

module.exports = {
    mongoConnect,
    getDb
}
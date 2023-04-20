var admin = require("firebase-admin");

var serviceAccount = require("../a04-backend-firebase-adminsdk-tusvg-444406ef1b.json")

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

module.exports = { admin, db };
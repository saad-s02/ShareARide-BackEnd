const firebase = require('firebase');

const firebaseConfig = {
    apiKey: "AIzaSyC0uBd1oV1mgqO8SViWPD0zthKnWK-kc4o",
    authDomain: "a04-backend.firebaseapp.com",
    projectId: "a04-backend",
    storageBucket: "a04-backend.appspot.com",
    messagingSenderId: "202873209205",
    appId: "1:202873209205:web:71b0a1196ef556be25533c"
  };

firebase.initializeApp(firebaseConfig); // initialize firebase app
module.exports = { firebase }; // export the app
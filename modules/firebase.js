const firebase = require("firebase");

let fbConfig;
if (process.env.NODE_ENV) { // Running on production server
	var SECRETS = process.env; // Configureation is stored on process environment
	fbConfig = {
	  apiKey: SECRETS.FIREBASE_API_KEY,
	  authDomain: SECRETS.FIREBASE_PRJ_ID + ".firebaseapp.com",
	  databaseURL: "https://" + SECRETS.FIREBASE_DB_NAME + ".firebaseio.com",
	  storageBucket: SECRETS.FIREBASE_BUCKET + ".appspot.com",
	};
} else { // Running on local machine
	var SECRETS = require('../config');
  fbConfig = {
    apiKey: SECRETS.FIREBASE.API_KEY,
    authDomain: SECRETS.FIREBASE.PRJ_ID + ".firebaseapp.com",
    databaseURL: "https://" + SECRETS.FIREBASE.DB_NAME + ".firebaseio.com",
    storageBucket: SECRETS.FIREBASE.BUCKET + ".appspot.com",
  };
}

firebase.initializeApp(fbConfig);
let database = firebase.database();
module.exports = database;

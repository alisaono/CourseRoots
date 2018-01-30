const passport = require('passport');
const MITStrategy = require('passport-mitopenid').MITStrategy;
const database = require('./firebase');

let host;
let openIDConfig;
if (process.env.NODE_ENV) { // Running on production server
	host = 'http://www.courseroots.site/';
	let SECRETS = process.env; // Configureation is stored on process environment
	openIDConfig = {
		clientID: SECRETS.OPENID_CLIENT_ID,
		clientSecret: SECRETS.OPENID_CLIENT_SECRET,
		callbackURL: host + '/auth/mitopenid/callback'
	};
} else { // Running on local machine
	host = 'http://localhost:3000';
	let SECRETS = require('../config');
	openIDConfig = {
		clientID: SECRETS.OPENID.CLIENT_ID,
		clientSecret: SECRETS.OPENID.CLIENT_SECRET,
		callbackURL: host + '/auth/mitopenid/callback'
	};
}

passport.use('mitopenid', new MITStrategy(openIDConfig,
	function (accessToken, refreshToken, profile, done) {

	let userID = profile.id;
	let ref = database.ref("/users/")
	ref.orderByKey().equalTo(userID).once("value").then(function(snapshot) {
		let user = snapshot.val();
		if (user === null) {
			return createUser(profile);
		} else {
			return done(null, user[userID]);
		}
	});

	function createUser(profile) {
		let newUser = {
			first_name: profile.given_name,
			last_name: profile.family_name,
			email: profile.email,
			mit_id: profile.id,
			kerbero: profile.preferred_username,
		}
		database.ref("/users/"+profile.id).set(newUser, function(error) {
		  if (error) {
		    return done(error);
		  } else {
		    return done(null, newUser);
		  }
		})
	}
}));

// store the user's id into the user's session. store just the id
// so that it's efficient.
// see: http://www.passportjs.org/docs/configure/
passport.serializeUser(function (user, done) {
	done(null, user.mit_id);
});

// retrieve the id that we saved in the user's cookie session with
// serializeUser, find that user with User.findById, then finally,
// place that user inside of req.user with done(err, user)
// see: http://www.passportjs.org/docs/configure/
passport.deserializeUser(function (id, done) {
	let ref = database.ref("/users/")
	ref.orderByKey().equalTo(id).once("value").then(function(snapshot) {
		let user = snapshot.val();
		done(null, user[id]);
	});
});

module.exports = passport;

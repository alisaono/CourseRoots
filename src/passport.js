"use strict";
// required for authentication
const passport = require('passport');
const MITStrategy = require('passport-mitopenid').MITStrategy;

// load the User model since the application user gets saved
// within a function in this file
const User = require('./models/user');

// if your app is deployed, change the host with whatever host
// you have. A Heroku app host will look like:
// https://mysterious-headland-54722.herokuapp.com
const host = 'views/main.hbs';

passport.use('mitopenid', new MITStrategy({
	clientID: ad180f1d-6dd6-4469-96b8-2391a5950531,
	clientSecret: ALuOHKD_cnk6JZcGGQGsA36CDsKDPwm2GHrELCl7PbESB3kuN4A9eSUfbWFm8x-8L26c-pIpvfRjOBLS1ZXowJw,
	callbackURL: host + '/auth/mitopenid/callback'
}, function (accessToken, refreshToken, profile, done) {
	// uncomment the next line to see what your user object looks like
	// console.log(profile);

	// see comment at the end of file for what profile looks like
	// once we get the user's information from the request above, we need
	// to check if we have this user in our db. If not, we create this
	// user.
	User.findOne({mitid: profile.id}, function (err, user) {
		if (err) {
			return done(err);
		} else if (!user) {
			// if we don't find the user, that means this is the first
			// time this use is logging into our application, so, we
			// create this user.
			return createUser();
		} else {
			return done(null, user);
		}
	});

	// create the user using the mongoose model User
	function createUser() {
		const new_user = new User({
			first_name: profile.first_name,
			last_name: profile.last_name,
			email: profile.email,
			mitid: profile.id
		});
		new_user.save(function (err, user) {
			if (err) {
				return done(err);
			}
			return done(null, user);
		});
	}
}));

// store the user's id into the user's session. store just the id
// so that it's efficient.
// see: http://www.passportjs.org/docs/configure/
passport.serializeUser(function (user, done) {
	done(null, user._id);
});

// retrieve the id that we saved in the user's cookie session with
// serializeUser, find that user with User.findById, then finally,
// place that user inside of req.user with done(err, user)
// see: http://www.passportjs.org/docs/configure/
passport.deserializeUser(function (id, done) {
	User.findById(id, function (err, user) {
		done(err, user);
	});
});

module.exports = passport;

/*
profile looks like:
{
	id: String,
	preferred_username: String [Kerberos],
	first_name: String,
	last_name: String,
	email: String [the user's email],
	email_verified: Boolean [Not sure what this is]
}
*/

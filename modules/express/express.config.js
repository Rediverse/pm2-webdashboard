const flash = require('connect-flash');
const express = require('express');

//Body Parser
const bodyParser = require('body-parser');
//Cookie Parser
const cookieParser = require('cookie-parser');

const chalk = require('chalk');

const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const config = require('../../dash.config');

module.exports = function(app, db) {
	// set the view engine to ejs
	app.set('view engine', 'ejs');

	// use body parser so we can get info from POST and/or URL parameters
	app.use(bodyParser.urlencoded({ extended: false }));

	// use cookie parser to get cookies
	app.use(cookieParser());

	// Initialize Express Session
	app.use(
		require('express-session')({
			secret: config.SESSION_SECRET,
			resave: false,
			saveUninitialized: false
		})
	);

	app.use(flash());

	// use public directory as static
	app.use(express.static('public'));

	// Local strategy for passport
	passport.use(
		new LocalStrategy(
			{
				usernameField: 'username',
				passwordField: 'pwd'
			},
			async (username, password, done) => {
				let user = await db.getData('/login/user');
				if (user.username == username && user.pwd == password) {
					return done(null, user);
				} else {
					return done(null, false);
				}
			}
		)
	);

	// use passport
	app.use(passport.initialize());

	// use passport session
	app.use(passport.session());

	//serialize passport
	passport.serializeUser((user, done) => {
		done(null, user);
	});

	//deserialize passport
	passport.deserializeUser((user, done) => {
		done(null, user);
	});

	console.log(chalk.yellow('[WEBSERVER]: Express configured.'));
};

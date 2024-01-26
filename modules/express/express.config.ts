import { Express } from 'express';
import { JsonDB } from 'node-json-db';

import flash from 'connect-flash';
import express from 'express';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import chalk from 'chalk';
import passport from 'passport';
import * as config from '../../dash.config';
import { Strategy as LocalStrategy } from 'passport-local';
import express_session from 'express-session';

export default function setupExpress(app: Express, db: JsonDB) {
	// set the view engine to ejs
	app.set('view engine', 'ejs');
	
		// use body parser so we can get info from POST and/or URL parameters
		app.use(bodyParser.urlencoded({ extended: false }));
	
		// use cookie parser to get cookies
		app.use(cookieParser());
	
		// Initialize Express Session
		app.use(
			express_session({
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
		passport.deserializeUser((user: Express.User, done) => {
			done(null, user);
		});
	
		console.log(chalk.yellow('[WEBSERVER]: Express configured.'));
}
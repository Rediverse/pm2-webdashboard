//Body Parser
const bodyParser = require('body-parser');
//Cookie Parser
const cookieParser = require('cookie-parser');

const chalk = require('chalk');

const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

module.exports = function(app) {
	// set the view engine to ejs
	app.set('view engine', 'ejs');

	// use body parser so we can get info from POST and/or URL parameters
	app.use(bodyParser.urlencoded({ extended: false }));

	// use cookie parser to get cookies
	app.use(cookieParser());

	console.log(chalk.yellow('[WEBSERVER]: Express configured.'));
};

const chalk = require('chalk');

module.exports = function(app) {
	app.get('/', (req, res) => {
		res.render('index');
	});

	console.log(chalk.yellow('[WEBSERVER]: Express routes loaded.'));
};

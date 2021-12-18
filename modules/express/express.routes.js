const chalk = require('chalk');

const passport = require('passport');

module.exports = function(app, db) {
	app.get('/', async (req, res) => {
		let isSetuped = false;
		try {
			isSetuped = await db.getData('/isSetuped');
		} catch (e) {}

		if (isSetuped == true) {
			if (!req.user) {
				res.redirect('/login');
				return;
			}
			let processes = await db.getData('/processes');
			res.render('index', { processes });
		} else {
			res.redirect('/setup');
		}
	});

	app.get('/logout', (req, res) => {
		req.logout();
		res.redirect('/login');
	});

	app.get('/login', (req, res) => {
		res.render('login');
	});

	app.post('/login', passport.authenticate('local', { failureRedirect: '/login' }), function(req, res) {
		res.redirect('/');
	});

	app.get('/setup', async (req, res) => {
		let isSetuped = false;
		try {
			isSetuped = await db.getData('/isSetuped');
		} catch (e) {}

		let setupStep = await db.getData('/setupStep');

		if (isSetuped == false) {
			res.render('setup', { setupStep });
		} else {
			res.redirect('/');
		}
	});

	app.post('/setup/step/:id', async (req, res) => {
		let setupStep = await db.getData('/setupStep');
		if (req.params.id == setupStep + 1) {
			if (req.params.id == 1) {
				await db.push('/login', {
					user: {
						username: req.body.username,
						pwd: req.body.pwd
					}
				});
			}
			await db.push('/setupStep', setupStep + 1);
			console.log(req.body);
			res.redirect('back');
			await require('../wait')(1000);
			if (setupStep + 1 == 3) {
				await db.push('/isSetuped', true);
			}
		} else {
			res.redirect('back');
		}
	});

	console.log(chalk.yellow('[WEBSERVER]: Express routes loaded.'));
};

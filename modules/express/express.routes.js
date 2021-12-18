Array.prototype.filter = function(condition) {
	let arr = [];
	this.forEach(item => {
		if (condition(item) == true) arr.push(item);
	});

	return arr;
};

const { startProcess, stopProcess, getLogs, restartProcess } = require('../pm2');

const chalk = require('chalk');

const passport = require('passport');

module.exports = function(app, db) {
	function loginCheck(req, res, next) {
		if (!req.user) {
			req.flash('err', 'You have to be logged in to view this page.');
			res.redirect('/login');
			return;
		} else {
			next();
		}
	}

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

	app.get('/processData/:id', async (req, res) => {
		let processes = await db.getData('/processes');
		let process = await processes.filter(process => process.id == req.params.id)[0];
		res.json(process);
	});

	app.get('/logout', loginCheck, (req, res) => {
		req.logout();
		res.redirect('/login');
	});

	app.get('/login', async (req, res) => {
		let isSetuped = false;
		try {
			isSetuped = await db.getData('/isSetuped');
		} catch (e) {}

		if (isSetuped == true) {
			res.render('login');
		} else {
			res.redirect('/setup');
		}
	});

	app.get('/process/:id', loginCheck, async (req, res) => {
		let processInfo = await db.getData('/processes');
		let data = await processInfo.filter(process => process.id == req.params.id)[0];
		res.render('process', { process: data });
	});

	app.post('/process/:id/:action', loginCheck, async (req, res) => {
		const { id, action } = req.params;
		if (action == 'stop') {
			await stopProcess(id);
			req.flash('success', 'Process stopped!');
		} else if (action == 'start') {
			await startProcess(id);
			req.flash('success', 'Process started!');
		} else if (action == 'restart') {
			await restartProcess(id);
			req.flash('success', 'Process restarted!');
		}
		res.redirect('back');
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

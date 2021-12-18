const app = require('express')();
const chalk = require('chalk');
const config = require('./dash.config.js');
const { fetchProc } = require('./modules/pm2.js');
const moment = require('moment');

let db;

(async () => {
	try {
		db = require('./modules/db/db.js')();
	} catch (e) {}

	await require('./modules/db/prepareDb')(db);
	require('./modules/express/express.config.js')(app, db);
	require('./modules/express/express.routes.js')(app, db);
	await refetchProcesses();
})();

Array.prototype.random = function(count) {
	if (!count) count = 1;

	let items = this[Math.floor(Math.random() * this.length)];

	if (count > 1) {
		items = [];
		for (let i = 0; i < count; i++) {
			items.push(this[Math.floor(Math.random() * this.length)]);
		}
	}

	return items;
};

Array.prototype.filter = function(condition) {
	let arr = [];
	this.forEach(item => {
		if (condition(item) == true) arr.push(item);
	});

	return arr;
};

Array.prototype.getElements = function(element) {
	let returnArr = [];
	this.forEach(item => {
		let el = item[element];
		if (!returnArr.includes(el)) returnArr.push(el);
	});

	return returnArr;
};

Array.prototype.search = function(query) {
	let arr = [];
	this.forEach(item => {
		if (query(item)) arr.push(item);
	});

	return arr;
};

let processes = [];

(async () => {
	await startup();
})();

//Run express webserver
if (config.BIND_IP.enabled == true) {
	app.listen(config.PORT, config.BIND_IP.ip, () => {
		console.log(
			chalk.green(`[WEBSERVER]: Server listening on port ${config.PORT} and bound to IP ${config.BIND_IP.ip}.`)
		);
	});
} else {
	app.listen(config.PORT, () => {
		console.log(chalk.green(`[WEBSERVER]: Server listening on port ${config.PORT}`));
	});
}

async function startup() {
	await fetchProc(processes);
	console.log(chalk.blue('[PROCESSES]: Processes fetched successfully!', JSON.stringify(processes)));
	require('./modules/db/prepareDb')(db);
}

let fetchInterval;

async function refetchProcesses() {
	fetchInterval = setTimeout(async () => {
		processes = [];
		await fetchProc(processes);
		console.log(chalk.blue('[PROCESSES]: Processes refetched successfully!', JSON.stringify(processes)));
		db.push('/processes', processes);
	}, 10 * 1000);
}

async function stopFetching() {
	if (fetchInterval) {
		clearTimeout(fetchInterval);
	}
}

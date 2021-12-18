const app = require('express')();
const chalk = require('chalk');
const config = require('./dash.config');
const { fetchProc } = require('./modules/pm2');

require('./modules/express/configuration')(app);
require('./modules/express/routes')(app);
const db = require('./modules/db/db')();

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
	console.log(chalk.blue('[PROCESSES]: Processed fetch successfully!', JSON.stringify(processes)));
	require('./modules/db/prepareDb')(db);
}

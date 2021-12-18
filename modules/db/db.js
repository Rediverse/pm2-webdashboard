const { JsonDB } = require('node-json-db');
const { Config } = require('node-json-db/dist/lib/JsonDBConfig');
const chalk = require('chalk');

module.exports = function() {
	const db = new JsonDB(new Config('db', true, false, '/'));
	console.log(chalk.yellow('[DATABASE]: Database loaded.'));

	return db;
};

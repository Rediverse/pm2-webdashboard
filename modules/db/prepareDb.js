const chalk = require('chalk');

module.exports = async function(db) {
	let data = await db.getData('/');
	if (!data.isSetuped) {
		await db.push('/isSetuped', false);
		console.log(chalk.red("[DATABASE]: Login is not setuped. Added 'isSetuped: false' to database."));
	}

	console.log(chalk.green('[DATABASE]: Database prepared.'));
};

const chalk = require('chalk');

module.exports = async db =>
	new Promise(async resolve => {
		let data = await db.getData('/');
		if (!data.isSetuped && data.isSetuped != false && data.isSetuped != true) {
			await db.push('/isSetuped', false);
			await db.push('/setupStep', 0);
			console.log(chalk.red("[DATABASE]: Login is not setuped. Added 'isSetuped: false' to database."));
		}

		console.log(chalk.green('[DATABASE]: Database prepared.'));

		resolve();
	});

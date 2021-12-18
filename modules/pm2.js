const listCommand = 'pm2 jlist'; //normal command is pm2 list, but you can use jlist for json :)

const { exec } = require('child_process');

//fetch the processes
const fetchProc = arr =>
	new Promise(async resolve => {
		await exec(listCommand, async (err, processRaw, stderr) => {
			// console.log(processRaw);
			arr = [];
			await JSON.parse(processRaw).forEach(process => {
				arr.push({ name: process.name, id: process.pm_id, monit: process.monit });
			});
			resolve();
		});
	});

module.exports = {
	fetchProc
};

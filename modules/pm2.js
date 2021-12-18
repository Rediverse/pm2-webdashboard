const listCommand = 'pm2 jlist'; //normal command is pm2 list, but you can use jlist for json :)

const { exec } = require('child_process');

const moment = require('moment');

//fetch the processes
const fetchProc = arr =>
	new Promise(async resolve => {
		await exec(listCommand, async (err, processRaw, stderr) => {
			// console.log(processRaw);
			await JSON.parse(processRaw).forEach(process => {
				let uptime = moment.duration(moment.now() - process.pm2_env.pm_uptime, 'milliseconds').humanize();
				console.log(uptime, moment.now() - process.pm2_env.pm_uptime);
				arr.push({
					name: process.name,
					id: process.pm_id,
					monit: process.monit,
					uptime,
					status: process.pm2_env.status,
					version: process.pm2_env.version
				});
			});
			resolve();
		});
	});

const stopProcess = id =>
	new Promise(async resolve => {
		await exec(`pm2 stop ${id}`, async (err, processRaw, stderr) => {
			resolve();
		});
	});

const startProcess = id =>
	new Promise(async resolve => {
		await exec(`pm2 start ${id}`, async (err, processRaw, stderr) => {
			resolve();
		});
	});

const getLogs = id =>
	new Promise(async resolve => {
		await exec(`pm2 logs ${id}`, async (err, processRaw, stderr) => {
			resolve(processRaw);
		});
	});

module.exports = {
	fetchProc,
	startProcess,
	stopProcess,
	getLogs
};

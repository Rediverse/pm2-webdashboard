module.exports = time =>
	new Promise(async resolve => {
		setTimeout(() => {
			resolve();
		}, time);
	});

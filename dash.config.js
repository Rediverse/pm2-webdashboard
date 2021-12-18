//Your fancy port to run this dashboard on
const PORT = 80;

//Local only
const BIND_IP = {
	enabled: true, //if disabled, everyone will be able to access the dashboard. If you're running this on your own Raspberry Pi, you should enable this.
	ip: '127.0.0.1' //the IP address to bind to.
};

const SESSION_SECRET = 'Kiboad kat'; //Change this to something unique.

module.exports = {
	PORT,
	BIND_IP,
	SESSION_SECRET
};

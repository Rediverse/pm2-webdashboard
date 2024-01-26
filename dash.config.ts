//Your fancy port to run this dashboard on
export const PORT: number = 1202;

//Local only
export const BIND_IP: {enabled: boolean, ip: string} = {
	enabled: true, //if disabled, everyone will be able to access the dashboard. If you're running this on your own Raspberry Pi, you should enable this.
	ip: '127.0.0.1' //the IP address to bind to.
};

export const SESSION_SECRET: string = 'Kiboad kat'; //Change this to something unique.
# pm2-webdashboard
A self hosted web interface for PM2.

## How to install
First, you have to get the dashboard on your server, Raspberry Pi or what ever you will use this on. You can get it using the following command:
```
git clone https://github.com/Rediverse/pm2-webdashboard
```

Next, go to the directory you cloned it into:
```
cd pm2-webdashboard
```

Install packages:
```
npm i 
```

Start it using node first:
```
node . 
```

Go through the setup and do the steps it will tell you. You will have to start it using PM2 after the setup is completed. It will tell you when to do it :)
If you change something in the config file, please restart the process of the dashboard.


## How to uninstall
First, stop the process using PM2.
```
pm2 stop <ID of the Web Dashboard>
```

Run NPKill:
```
npx npkill
```
If needed, confirm with y. Press space and exit NPKill with Ctrl + C. Now delete the directory of the dashboard.

### What NPKill did
NPKill removed your node_modules folder so it takes less to delete the folder of the dashboard.

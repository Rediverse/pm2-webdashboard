import express from 'express';
import chalk from 'chalk';
import * as config from './dash.config';
import { Proc, fetchProcesses } from './modules/pm2';
import getDB from './modules/db/db';
import prepDB from './modules/db/prepareDb';
import configureExpress from './modules/express/express.config';
import configureRoutes from './modules/express/express.routes';

const app = express();

let db = getDB();

(async () => {
    try {
        await prepDB(db);
    } catch {}
    configureExpress(app, db);
    configureRoutes(app, db);
})();

export let processes: Proc[] = [];

startup();

//Run express webserver
if (config.BIND_IP.enabled == true) {
    app.listen(config.PORT, config.BIND_IP.ip, () => {
        console.log(
            chalk.green(
                `[WEBSERVER]: Server listening on port ${config.PORT} and bound to IP ${config.BIND_IP.ip}.`
            )
        );
    });
} else {
    app.listen(config.PORT, () => {
        console.log(
            chalk.green(`[WEBSERVER]: Server listening on port ${config.PORT}`)
        );
    });
}

async function startup() {
    processes = await fetchProcesses();
    console.log(
        chalk.blue(
            '[PROCESSES]: Processes fetched successfully!',
            JSON.stringify(processes)
        )
    );
    await prepDB(db);
    await refetchProcesses();
}

let fetchInterval: number = -1;

async function refetchProcesses() {
    fetchInterval = setInterval(async () => {
        refetch();
    }, 10 * 1000) as any as number;
}

export async function refetch() {
    processes = await fetchProcesses();
    console.log(
        chalk.blue('[PROCESSES]: Processes refetched successfully!')
    );
}

async function stopFetching() {
    if (fetchInterval) {
        clearTimeout(fetchInterval);
    }
}

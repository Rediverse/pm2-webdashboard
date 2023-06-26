import { JsonDB } from 'node-json-db';
import { Config } from 'node-json-db/dist/lib/JsonDBConfig';
import chalk from 'chalk';

export default function getDb(): JsonDB {
    const db = new JsonDB(new Config('db', true, false, '/'));
    console.log(chalk.yellow('[DATABASE]: Database loaded.'));

    return db;
}

export interface JsonDBData {
    isSetuped: boolean;
    setupStep: number;
    login?: {
        user: {
            username: string;
            pwd: string;
        };
    };
}

import type { JsonDB } from 'node-json-db';
import type { JsonDBData } from './db';
import chalk from 'chalk';

export default async function prepeareDb(db: JsonDB) {
    let data = (await db.getData('/')) as JsonDBData;
    if (!data.isSetuped && data.isSetuped != false && data.isSetuped != true) {
        db.push('/isSetuped', false);
        db.push('/setupStep', 0);
        console.log(
            chalk.red(
                "[DATABASE]: Login is not setuped. Added 'isSetuped: false' to database."
            )
        );
    }

    console.log(chalk.green('[DATABASE]: Database prepared.'));
}

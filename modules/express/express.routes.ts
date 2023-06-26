import {
    startProcess,
    stopProcess,
    readLogs,
    restartProcess,
    removeProcess,
    clearLog,
    createService,
} from '../pm2';
import chalk from 'chalk';
import type { Express } from 'express';
import type { JsonDB } from 'node-json-db';
import passport from 'passport';
import { noop, wait } from '../utils';
import { processes, refetch } from '../../index';
import { hostname } from 'os';

export default function Route(app: Express, db: JsonDB) {
    function loginCheck(req, res, next) {
        if (!req.user) {
            req.flash('err', 'You have to be logged in to view this page.');
            res.redirect('/login');
            return;
        } else {
            next();
        }
    }

    app.get('/', async (req, res) => {
        let isSetuped = false;
        try {
            isSetuped = await db.getData('/isSetuped');
        } catch (e) {}

        if (isSetuped == true) {
            if (!req.user) {
                req.flash('err', 'You have to be logged in to view this page.');
                res.redirect('/login');
                return;
            }
            res.render('index', {
                processes,
                pc_name: hostname(),
                flash: { err: req.flash('err'), success: req.flash('success') },
            });
        } else {
            res.redirect('/setup');
        }
    });

    app.get('/create', loginCheck, (req, res) => {
        res.render('create_proc', {
            flash: { err: req.flash('err'), success: req.flash('success') },
        });
    });

    app.post('/create', loginCheck, async (req, res) => {
        if (
            await createService(
                req.body.path,
                req.body.name,
                Number(req.body.kill_timeout),
                Number(req.body.restart_delay),
                Number(req.body.max_mem),
                req.body.args.length > 0 ? req.body.args.split(' ') : [],
                req.body.node_args.length > 0
                    ? req.body.node_args.split(' ')
                    : []
            )
        ) {
            req.flash(
                'success',
                `${
                    req.body.name ||
                    req.body.path.split('/').pop() ||
                    'unknown service'
                } was sucessfully created`
            );
        } else {
            req.flash(
                'err',
                `Failed to create ${
                    req.body.name ||
                    req.body.path.split('/').pop() ||
                    'unknown service'
                }`
            );
        }
        await refetch();
        res.redirect('/');
    });

    app.get('/processData/:id', loginCheck, async (req, res) => {
        res.json(processes.find((el) => el.name == req.params.id));
    });

    app.get('/logout', loginCheck, (req, res) => {
        req.flash('success', 'You have logged out successfully!');
        req.logout({ keepSessionInfo: false }, noop);
        res.redirect('/login');
    });

    app.get('/login', async (req, res) => {
        let isSetuped = false;
        try {
            isSetuped = await db.getData('/isSetuped');
        } catch (e) {}

        if (isSetuped == true) {
            res.render('login', {
                flash: { err: req.flash('err'), success: req.flash('success') },
            });
        } else {
            res.redirect('/setup');
        }
    });

    app.get('/process/:id', loginCheck, async (req, res) => {
        let data = processes.filter(
            (process) => process.name == req.params.id
        )[0];
        res.render('process', {
            process: data,
            processes,
            pc_name: hostname(),
            flash: { err: req.flash('err'), success: req.flash('success') },
        });
    });

    app.post('/process/:id/:action', loginCheck, async (req, res) => {
        const { id, action } = req.params;
        if (action == 'stop') {
            await stopProcess(id);
            req.flash('success', 'Process stopped!');
        } else if (action == 'start') {
            await startProcess(id);
            req.flash('success', 'Process started!');
        } else if (action == 'restart') {
            await restartProcess(id);
            req.flash('success', 'Process restarted!');
        } else if (action == 'remove') {
            await removeProcess(id);
            await refetch();
            return res.redirect('/');
        } else if (action == 'clearlogs') {
            let process = processes.find((el) => el.name == req.params.id);
            if (process) {
                clearLog(process.pm_err_log_path).catch(noop);
                clearLog(process.pm_out_log_path).catch(noop);
            }
        }
        await refetch();
        res.redirect('back');
    });

    app.get('/logs/:id', loginCheck, async (req, res) => {
        let process = processes.find((el) => el.name == req.params.id);
        if (process) {
            let path_stdout = process.pm_out_log_path;
            let path_stderr = process.pm_err_log_path;
            try {
                res.json({
                    stdout: await readLogs(path_stdout),
                    stderr: await readLogs(path_stderr),
                });
            } catch {
                res.status(500).json({
                    message: 'failed to read stderr/out',
                });
            }
        } else {
            res.status(404).json({ message: 'could not find service' });
        }
    });

    app.get('/loginfail', (req, res) => {
        req.flash('err', 'Invalid username or password!');
        res.redirect('/login');
    });

    app.post(
        '/login',
        passport.authenticate('local', { failureRedirect: '/loginfail' }),
        function (req, res) {
            req.flash('success', 'Welcome to the dashboard!');
            res.redirect('/');
        }
    );

    app.get('/setup', async (req, res) => {
        let isSetuped = false;
        try {
            isSetuped = await db.getData('/isSetuped');
        } catch (e) {}

        let setupStep = await db.getData('/setupStep');

        if (isSetuped == false) {
            res.render('setup', { setupStep });
        } else {
            res.redirect('/');
        }
    });

    app.post('/setup/step/:id', async (req, res) => {
        let setupStep = (await db.getData('/setupStep')) as number;
        if (Number(req.params.id) == setupStep + 1) {
            if (Number(req.params.id) == 1) {
                db.push('/login', {
                    user: {
                        username: req.body.username,
                        pwd: req.body.pwd,
                    },
                });
            }
            db.push('/setupStep', setupStep + 1);
            res.redirect('back');
            await wait(1000);
            if (setupStep + 1 == 3) {
                db.push('/isSetuped', true);
            }
        } else {
            res.redirect('back');
        }
    });

    console.log(chalk.yellow('[WEBSERVER]: Express routes loaded.'));
}
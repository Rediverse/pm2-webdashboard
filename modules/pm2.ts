import { access, constants, readFile, writeFile } from 'fs/promises';
import { spawn } from './utils';
import moment from 'moment';

interface NativeProcess {
    pid: number;
    name: string;
    pm2_env: {
        env: Record<string, string>;
        status: 'running' | 'stopped' | 'errored';
        version: string;
        created_at: number;
        pm_uptime: number;
        watch: boolean;
        autorestart: boolean;
        kill_retry_time: number;
        pm_out_log_path: string;
        pm_err_log_path: string;
        pm_exec_path: string;
        pm_cwd: string;
        args?: string[];
    };
    monit: Record<'memory' | 'cpu', number>;
}

export interface Proc {
    pid: number;
    name: string;
    env: Record<string, string>;
    status: 'running' | 'stopped' | 'errored';
    version: string;
    created_at: number;
    pm_uptime: number;
    watch: boolean;
    autorestart: boolean;
    kill_retry_time: number;
    pm_out_log_path: string;
    pm_err_log_path: string;
    pm_exec_path: string;
    pm_cwd: string;
    args: string[];
    humanized_uptime: string;
    humanized_created_at: string;
    memory_usage: number;
    cpu_usage: number;
}

export async function fetchProcesses(): Promise<Proc[]> {
    const proc = await spawn('pm2', ['jlist']);

    try {
        let procs = JSON.parse(proc.stdout.toString()) as NativeProcess[];
        let new_procs: Proc[] = [];

        for (let i = 0; i < procs.length; ++i) {
            const p = procs[i];
            new_procs.push({
                env: p.pm2_env.env,
                status: p.pm2_env.status,
                version: p.pm2_env.version,
                created_at: p.pm2_env.created_at,
                pm_uptime: p.pm2_env.pm_uptime,
                watch: p.pm2_env.watch,
                autorestart: p.pm2_env.autorestart,
                kill_retry_time: p.pm2_env.kill_retry_time,
                pm_out_log_path: p.pm2_env.pm_out_log_path,
                pm_err_log_path: p.pm2_env.pm_err_log_path,
                pm_exec_path: p.pm2_env.pm_exec_path,
                pm_cwd: p.pm2_env.pm_cwd,
				args: p.pm2_env.args || [],
				cpu_usage: p.monit.cpu,
				memory_usage: p.monit.memory,
				name: p.name,
				pid: p.pid,
				humanized_created_at: new Date(p.pm2_env.created_at).toUTCString(),
				humanized_uptime: moment.duration(moment.now() - p.pm2_env.pm_uptime, 'milliseconds').humanize(),
            });
        }
		return new_procs;
    } catch {
        return [];
    }
}

export async function stopProcess(process: string): Promise<void> {
	await spawn("pm2", ['stop', process]);
}

export async function startProcess(process: string): Promise<void> {
	await spawn("pm2", ['start', process]);
}

export async function restartProcess(process: string): Promise<void> {
	await spawn("pm2", ['restart', process]);
}

export async function removeProcess(process: string): Promise<void> {
	await spawn("pm2", ['delete', process]);
}

export async function readLogs(file:string): Promise<string> {
	return await readFile(file).then(buf => buf.toString()).catch(() => "");
}

export async function clearLog(file:string): Promise<void> {
	await writeFile(file, "");
}

export async function createService(file: string, name: string, killTimeout: number, restartDelay: number, maxMem: number, args: string[], node_args: string[]): Promise<boolean> {
    try {
        await access(file, constants.R_OK);

        let args = ['start', file.toString()];
        if (name) args.push('--name', name.toString());
        if (killTimeout > 0) args.push('--kill-timeout', killTimeout.toString());
        if (restartDelay > 0) args.push('--restart-delay', restartDelay.toString());
        if (maxMem > 0) args.push('--max-memory-restart', maxMem.toString());
        if (node_args.length > 0) args.push("--node_args", '"' + node_args.join('", "') + '"');
        if (args.length > 0) args.push("--", ...args);
        await spawn("pm2", args);

        return true;
    } catch {
        return false;
    }
}
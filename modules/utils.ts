import {spawn as c_spawn} from "child_process";

export function wait(ms: number): Promise<void> {
    return new Promise(res => setTimeout(res, ms));
}

interface SpawnedProcess {
    exit_code: number;
    stderr: Buffer;
    stdout: Buffer;
    sig?: NodeJS.Signals,
}

export function spawn(command: string, args: string[]): Promise<SpawnedProcess> {
    return new Promise(res => {
        const proc = c_spawn(command, args);

        const stderr: any[] = [];
        const stdout: any[] = [];

        proc.stdout.on('data', (dat) => stdout.push(dat));
        proc.stderr.on('data', (dat) => stderr.push(dat));

        proc.on('close', (code, singal) => {
            res({
                sig: singal ? singal : undefined,
                exit_code: code||0,
                stderr: Buffer.concat(stderr),
                stdout: Buffer.concat(stdout),
            });
        });
    });
}
export function noop(){}
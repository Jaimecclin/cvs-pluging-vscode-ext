import * as vscode from 'vscode';
import {spawn} from 'child_process';

let WhiteBoard2 = vscode.window.createOutputChannel("WhiteBoard2");

export class CVS {

    private folderRoot;
    private platform;

    constructor(folderRoot: string, platform: string) {
        this.folderRoot = folderRoot;
        this.platform = platform;
    };

    private createCommand(cmd: string, options: string[]=[]) {
        if (this.platform === 'win32') {
            options.unshift(cmd);
            return spawn('powershell', options, {cwd: this.folderRoot});
        }
        else {
            return spawn(cmd, options, {cwd: this.folderRoot});
        }
    }

    onGetRevision(filePath: string): Promise<[number, string | undefined]> {
        const cvs = this.createCommand("cvs", ["-bSN", "log", filePath]);
        const head = this.createCommand("head", ["-n", "30"]);
        const grep = this.createCommand('grep', ["-m", "1", "-Po", "'(?<=revision )[^ ]+'"]);

        cvs.stdout.pipe(grep.stdin);
        head.stdout.pipe(cvs.stdin);
        grep.stdout.pipe(process.stdin);

        return new Promise((resolve, reject) => {
            let res = '';
            grep.once('exit', (code: number, signal: string) => {
                if (res.length) {
                    resolve([code, res]);
                }
                else {
                    resolve([code, undefined]);
                }
            });

            grep.once('error', (err: Error) => {
                reject(err);
            });

            grep.stdout
            .on("data", (chunk: string | Buffer) => {
                res += chunk.toString().replace(/[\r\n]/g, '\n');
            });

            grep.stderr
            .on("data", (chunk: string | Buffer) => {
            });
        });
    }

    onGetDiff(filePath: string): Promise<[number, string | undefined]> {
        const diff = this.createCommand('cvs', ['diff', '-u', filePath]);
        return new Promise((resolve, reject) => {
            let content = '';

            diff.once('exit', (code: number, signal: string) => {
                // CVS diff command: 
                //   return error code 0 means no difference
                //   return error code 1 means having difference or command wrong 
                resolve([0, content]);
            });

            diff.once('error', (err: Error) => {
                reject(err);
            });

            diff.stdout
            .on("data", (chunk: string | Buffer) => {
                content += chunk.toString().replace(/[\r\n]/g, '\n');
            });

            diff.stderr
            .on("data", (chunk: string | Buffer) => {
            });
        });
    }
    
    onGetStatus(): Promise<[number, string | undefined]> {
        const proc = this.createCommand('cvs', ['-qn', 'update']);
        // TODO: Reduce the data
        // const proc = spawn(
        //     'cvs', 
        //     ['-d', this.m_CVSRoot, '-qn', 'update'], 
        //     {cwd: this.m_WorkDir}
        // );

        return new Promise((resolve, reject) => {
            let changes = '';
            proc.once('exit', (code: number, signal: string) => {
                if (changes.length) {
                    resolve([code, changes]);
                }
                else {
                    resolve([code, undefined]);
                }
            });

            proc.once('error', (err: Error) => {
                // console.error("process error")
                // WhiteBoard.appendLine('process error');
                reject(err);
            });

            proc.stdout
            .on("data", (chunk: string | Buffer) => {
                changes += chunk.toString().replace(/[\r\n]/g, '\n');
            });

            proc.stderr
            .on("data", (chunk: string | Buffer) => {
                // this.m_Logger.print(chunk as string);
                // console.error("stderr")
                // WhiteBoard.appendLine('stderr');
            });
        });
    }
}
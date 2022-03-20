import * as vscode from 'vscode';
import {spawn} from 'child_process';

// let WhiteBoard2 = vscode.window.createOutputChannel("WhiteBoard2");

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

    onGetDiff(): Promise<[number, string | undefined]> {

        return new Promise((resolve, reject) => {});
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
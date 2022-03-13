import * as vscode from 'vscode';
import {spawn} from 'child_process';

let WhiteBoard = vscode.window.createOutputChannel("WhiteBoard");

export class CVS {

    private folderRoot;
    private platform;

    constructor(folderRoot: string, platform: string) {
        this.folderRoot = folderRoot;
        this.platform = platform;
    };

    private createCommand(cmd: string, options: string[]=[]) {
        // WhiteBoard.appendLine("execute place:" + this.folderRoot);
        // WhiteBoard.show();
        if (this.platform === 'win32') {
            options.unshift(cmd);
            return spawn('powershell', options, {cwd: this.folderRoot});
        }
        else {
            return spawn(cmd, options, {cwd: this.folderRoot});
        }
        
    }
    
    onGetStatus(): Promise<[number, string | undefined]> {
        const proc = this.createCommand('cvs', ['status']);
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
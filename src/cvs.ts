import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import {spawn} from 'child_process';

import { logger } from './log'

export class CVS {

    private folderRoot;
    private platform;
    private repoName;

    constructor(folderRoot: string, platform: string) {
        this.folderRoot = folderRoot;
        this.platform = platform;
        try {
            this.repoName = fs.readFileSync(path.join(folderRoot, 'CVS/Repository'), 'utf8').trim();
        } catch (err) {
            const msg = 'CVS-plugin cannot find CVS/Repository in the workspace. Use the folder name as default';
            vscode.window.showInformationMessage(msg);
            this.repoName = path.basename(folderRoot)
        }
    };
        

    private createCommand(cmd: string, options: string[]=[]) {
        if (this.platform === 'win32') {
            options.unshift(cmd);
            return spawn('powershell', options, {cwd: this.folderRoot});
        }
        else {
            logger.appendLine("$ " + this.folderRoot + " > " + cmd + ' ' + options.join(' '));
            return spawn(cmd, options, {cwd: this.folderRoot});
        }
    }

    onGetRevision(filePath: string): Promise<[number, string | undefined]> {
        const cvs = this.createCommand("cvs", ["log", "-bSN", filePath]);
        const head = this.createCommand("head", ["-n", "50"]);
        const grep = this.createCommand('grep', ["-m", "1", "-Po", "revision \d*.\d*"]);
        const tr = this.createCommand('tr', ["-d", "revision "]);

        cvs.stdout.pipe(head.stdin);
        head.stdout.pipe(grep.stdin);
        grep.stdout.pipe(tr.stdin);
        tr.stdout.pipe(process.stdin);
        grep.on('close', () => {
            logger.appendLine('grep command is closing');
        });

        return new Promise((resolve, reject) => {
            let res = '';
            tr.once('exit', (code: number, signal: string) => {
                logger.appendLine("return code: " + code);
                if (res.length) {
                    resolve([code, res]);
                }
                else {
                    resolve([code, undefined]);
                }
            });

            tr.once('error', (err: Error) => {
                logger.appendLine('error: ' + err);
                reject(err);
            });

            tr.stdout
            .on("data", (chunk: string | Buffer) => {
                // logger.appendLine('stdout: ' + chunk);
                res += chunk.toString().replace(/[\r\n]/g, '\n');
            });

            tr.stderr
            .on("data", (chunk: string | Buffer) => {
                logger.appendLine(chunk as string);
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
                logger.appendLine(err.message);
                reject(err);
            });

            diff.stdout
            .on("data", (chunk: string | Buffer) => {
                content += chunk.toString().replace(/[\r\n]/g, '\n');
            });

            diff.stderr
            .on("data", (chunk: string | Buffer) => {
                logger.appendLine(chunk as string);
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
                logger.appendLine("return code: " + code);
                if (changes.length) {
                    resolve([code, changes]);
                }
                else {
                    resolve([code, undefined]);
                }
            });

            proc.once('error', (err: Error) => {
                logger.appendLine(err.message);
                reject(err);
            });

            proc.stdout
            .on("data", (chunk: string | Buffer) => {
                changes += chunk.toString().replace(/[\r\n]/g, '\n');
            });

            proc.stderr
            .on("data", (chunk: string | Buffer) => {
                logger.appendLine(chunk as string);
            });
        });
    }

    onCheckoutFile(filename: string, rev: string=""): Promise<[number, string | undefined]> {
        let proc: any;
        if(rev){
            const filepath = path.join(this.repoName, filename);
            proc = this.createCommand('cvs', ['co', '-p', '-r', rev, filepath]);
        }
        else{
            // Currently we go here
            const filepath = filename;
            proc = this.createCommand('cvs', ['-Q', 'update', '-C', '-p', filepath]);
        }

        return new Promise((resolve, reject) => {
            let content = '';
            proc.once('exit', (code: number, signal: string) => {
                logger.appendLine("return code: " + code);
                if (content.length) {
                    resolve([code, content]);
                }
                else {
                    resolve([code, undefined]);
                }
            });

            proc.once('error', (err: Error) => {
                logger.appendLine(err.message);
                reject(err);
            });

            proc.stdout
            .on("data", (chunk: string | Buffer) => {
                content += chunk.toString().replace(/[\r\n]/g, '\n');
            });

            proc.stderr
            .on("data", (chunk: string | Buffer) => {
                logger.appendLine(chunk as string);
            });
        });
    }

    onAnnotate(filename: string, rev: string=""): Promise<[number, string | undefined]> {
        let proc: any;
        if(rev){
            const filepath = path.join(this.repoName, filename);
        }
        else{
            // head
            const filepath = filename;
            proc = this.createCommand('cvs', ['annotate', filepath]);
        }

        return new Promise((resolve, reject) => {
            let content = '';
            proc.once('exit', (code: number, signal: string) => {
                logger.appendLine("return code: " + code);
                if (content.length) {
                    resolve([code, content]);
                }
                else {
                    resolve([code, undefined]);
                }
            });

            proc.once('error', (err: Error) => {
                logger.appendLine(err.message);
                reject(err);
            });

            proc.stdout
            .on("data", (chunk: string | Buffer) => {
                content += chunk.toString().replace(/[\r\n]/g, '\n');
            });

            proc.stderr
            .on("data", (chunk: string | Buffer) => {
                logger.appendLine(chunk as string);
            });
        });
    }

    onUpdate(): Promise<[number, string | undefined]> {
        let proc = this.createCommand('cvs', ['update', '-d']);
        return new Promise((resolve, reject) => {
            let content = '';
            proc.once('exit', (code: number, signal: string) => {
                logger.appendLine("return code: " + code);
                if (content.length) {
                    resolve([code, content]);
                }
                else {
                    resolve([code, undefined]);
                }
            });

            proc.once('error', (err: Error) => {
                logger.appendLine(err.message);
                reject(err);
            });

            proc.stdout
            .on("data", (chunk: string | Buffer) => {
                content += chunk.toString().replace(/[\r\n]/g, '\n');
            });

            proc.stderr
            .on("data", (chunk: string | Buffer) => {
                logger.appendLine(chunk as string);
            });
        });
    }
}
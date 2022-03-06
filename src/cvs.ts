import {spawn} from 'child_process';

export class CVS {

    private platform;

    constructor(platform: string) {
        this.platform = platform;
    };

    private createCommand(cmd: string, options: string[]=[]) {
        if (this.platform === 'win32') {
            options.unshift(cmd);
            return spawn('powershell', options);
        }
        else {
            return spawn(cmd, options);
        }
        
    }
    
    onGetStatus(): Promise<[number, string | undefined]> {
        const proc = this.createCommand('cvs update');
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
                console.error("process error")
                reject(err);
            });

            proc.stdout
            .on("data", (chunk: string | Buffer) => {
                changes += chunk.toString().replace(/[\r\n]/g, '\n');
            });

            proc.stderr
            .on("data", (chunk: string | Buffer) => {
                // this.m_Logger.print(chunk as string);
                console.error("stderr")
            });
        });
    }
}
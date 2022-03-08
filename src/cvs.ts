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
                // changes = 
                //     `
                //     ===================================================================
                //     File: optPlacePhase.cpp    Status: Up-to-date
                    
                //     Working revision:    1.229
                //     Repository revision:    1.229    /home/apcvs/cvsroot/work/src/opt/optPlacePhase.cpp,v
                //     Sticky Tag:        (none)
                //     Sticky Date:        (none)
                //     Sticky Options:    (none)
                    
                //     ===================================================================
                //     File: optPlacePhase.h      Status: Up-to-date
                    
                //     Working revision:    1.38
                //     Repository revision:    1.38    /home/apcvs/cvsroot/work/src/opt/optPlacePhase.h,v
                //     Sticky Tag:        (none)
                //     Sticky Date:        (none)
                //     Sticky Options:    (none)
                //     `;
            });

            proc.stderr
            .on("data", (chunk: string | Buffer) => {
                // this.m_Logger.print(chunk as string);
                console.error("stderr")
            });
        });
    }
}
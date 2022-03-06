// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as cp from 'child_process';
import * as path from 'path';
import * as fs from 'fs';
import * as ps from 'process';

import { NodeProvider } from './node';
import { CVS } from './cvs'

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('Congratulations, your extension "cvs-plugin" is now active!');

    let rootPath = '';
    if (!vscode.workspace.workspaceFolders) {
        rootPath = vscode.workspace.rootPath;
    }
    else { // TODO: Test
        if(vscode.workspace.workspaceFolders.length > 0) {
            rootPath = vscode.workspace.workspaceFolders[0].uri.fsPath;
        }
        else {
            rootPath = vscode.workspace.rootPath;
        }
        console.log("rootPath:", rootPath);
    }

    let platform = process.platform; //windows: win32, linux: linux, MacOS: darwin
    console.log("OS: ", process.platform);
    
    const debug = true;

    function exeCommand(command: string) {
        // Example: command = "powershell ls";
        if(platform == 'win32') {
            command = "powershell " + command;
        }
		let aaa = "";
        console.log("Command: ", command)
        // cp.exec(command, (err, stdout, stderr) => {
        //     let result = stdout;
        //     // console.log('stdout: ' + stdout);
        //     // console.log('stderr: ' + stderr);
        //     if (err) {
        //         console.log('error: ' + err);
        //         result += stderr;
        //     }
        //     aaa = result;
        //     // vscode.window.showInformationMessage(result);
        //     if(debug) {
        //         const filePath = path.join(rootPath, 'fileName.extension');
        //         fs.writeFileSync(filePath, result, 'utf8');
        
        //         const openPath = vscode.Uri.file(filePath);
        //         vscode.workspace.openTextDocument(openPath).then(doc => {
        //             vscode.window.showTextDocument(doc);
        //         });
        //     }
        // });
		// cp.execSync(command, cp.ExecSyncOptions());
    }

    // The command has been defined in the package.json file
    // Now provide the implementation of the command with  registerCommand
    // The commandId parameter must match the command field in package.json
    let disposable = vscode.commands.registerCommand('cvs-plugin.helloWorld', function () {
        // The code you place here will be executed every time your command is executed

        // Display a message box to the user
        vscode.window.showInformationMessage('Hello World from CVS-plugin!');
    });

    let cvsStatus = vscode.commands.registerCommand('cvs-plugin.status', async function () {
        const cvs = new CVS(platform);
        const res = await cvs.onGetStatus();
        if (res[0]) {
            vscode.window.showErrorMessage('Unable to show changes in local copy of repository:');
        }
        else {
            console.log(res[1])
            if (res[1]) {
                const regexp = /File: (?<filename>.+) *Status: (?<status>.+)/;
                const splited = res[1].split('\n');
                let files: string[] = [];
                for(let i=0; i<splited.length; i++){
                    const matched = regexp.exec(splited[i]);
                    if(matched != null){
                        files.push(matched.groups.filename.trim());
                        console.log(matched.groups.filename.trim());
                        console.log(matched.groups.status)
                    }
                }
                const nodeDependenciesProvider = new NodeProvider(rootPath);
                nodeDependenciesProvider.getData(files);
                vscode.window.registerTreeDataProvider('changed-files', nodeDependenciesProvider);
            }
            else {
                vscode.window.showErrorMessage('There are no changes.');
            }
        }
        
        // const regexp = /File: (?<filename>.+) *Status: (?<status>.+)/;
        // let data = 
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

    let cmdTest = vscode.commands.registerCommand('cvs-plugin.cmdTest', async function () {
        const inputCmd :string = await vscode.window.showInputBox();
        exeCommand(inputCmd);
    });

    context.subscriptions.push(disposable);
    context.subscriptions.push(cvsStatus);
}

// this method is called when your extension is deactivated
export function deactivate() {}

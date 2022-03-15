// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as cp from 'child_process';
import * as path from 'path';
import * as fs from 'fs';
import * as ps from 'process';

import { NodeProvider, File } from './node';
import { CVS } from './cvs'

// let WhiteBoard = vscode.window.createOutputChannel("WhiteBoard");

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('Congratulations, your extension "cvs-plugin" is now active!');

    let rootPath :string | undefined = '';
    if (!vscode.workspace.workspaceFolders) {
        rootPath = vscode.workspace.rootPath;
        // WhiteBoard.appendLine('Not workspace');
    }
    else { // TODO: Test
        if(vscode.workspace.workspaceFolders.length > 0) {
            rootPath = vscode.workspace.workspaceFolders[0].uri.fsPath;
            
            // for(let i = 0; i < vscode.workspace.workspaceFolders.length; i++) {
            //     WhiteBoard.appendLine('Workspace folder ' + i + ' , name :' + vscode.workspace.workspaceFolders[i].name);
            // }
        }
        else {
            rootPath = vscode.workspace.rootPath;
            // WhiteBoard.appendLine('workspace else');
        }
        // WhiteBoard.appendLine("rootPath:" + rootPath);
    }

    if(!rootPath) {
        vscode.window.showErrorMessage('CVS-plugin cannot access correct folder.');
    }

    // WhiteBoard.show();

    let platform = process.platform; //windows: win32, linux: linux, MacOS: darwin
    console.log("OS: ", process.platform);
    
    const debug = true;

    function dumpLog(data: string) {
        if(debug && rootPath) {
            const filePath = path.join(rootPath, 'fileName.extension');
            fs.appendFileSync(filePath, data, 'utf8');
    
            const openPath = vscode.Uri.file(filePath);
            vscode.workspace.openTextDocument(openPath).then(doc => {
                vscode.window.showTextDocument(doc);
            });
        }
    }

    function exeCommand(command: string) {
        // Example: command = "powershell ls";
        if(platform == 'win32') {
            command = "powershell " + command;
        }
        console.log("Command: ", command)
        cp.exec(command, (err, stdout, stderr) => {
            let result = stdout;
            // console.log('stdout: ' + stdout);
            // console.log('stderr: ' + stderr);
            if (err) {
                console.log('error: ' + err);
                result += stderr;
            }
            
            dumpLog(result);

            vscode.window.showInformationMessage("Success");
        });
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

        vscode.window.withProgress({
            location: vscode.ProgressLocation.Window,
            cancellable: false,
            title: 'CVS-plugin updating'
        }, async progress => {

            // progress.report({ message: '0' });
            if(!rootPath) {
                vscode.window.showErrorMessage('No set cvs root path');
                return;
            }

            const cvs = new CVS(rootPath, platform);
            const res = await cvs.onGetStatus();

            if (res[0]) {
                vscode.window.showErrorMessage('Unable to show changes in local copy of repository.');
            }
            else {
                if (res[1]) {
                    const regexp = /(?<status>[UMC?]) (?<filename>.+)/;
                    const splited = res[1].split('\n');
                    let files: File[] = [];
                    for(let i=0; i<splited.length; i++){
                        const matched = regexp.exec(splited[i]);
                        if(matched != null && matched.groups){
                            let status = 0;
                            const filename = matched.groups.filename.trim();
                            if(matched.groups.status === 'M')
                                status = 0;
                            else if(matched.groups.status === '?')
                                status = 1;
                            else if(matched.groups.status === 'U')
                                status = 2;
                            else if(matched.groups.status === 'C')
                                status = 3;
                            else
                                continue;
                            files.push(new File(filename, filename, status));
                        }
                    }
                    const nodeProvider = new NodeProvider(rootPath);
                    nodeProvider.getData(files);
                    vscode.window.registerTreeDataProvider('changed-files', nodeProvider);
                }
                else {
                    vscode.window.showErrorMessage('There are no changes.');
                }
            }
        });
        
    });

    let cmdTest = vscode.commands.registerCommand('cvs-plugin.cmdTest', async function () {
        // const inputCmd :string | undefined = await vscode.window.showInputBox();
        // if(inputCmd)
        //     exeCommand(inputCmd);
    });

    context.subscriptions.push(disposable);
    context.subscriptions.push(cvsStatus);
}

// this method is called when your extension is deactivated
export function deactivate() {
    console.log('Extension is deactivated');
}

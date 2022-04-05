// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as cp from 'child_process';
import * as path from 'path';
import * as fs from 'fs';
import * as ps from 'process';

import { NodeProvider, FolderProvider, File } from './node';
import { CVS } from './cvs'
import { logger } from './log'

let selectedFile: vscode.TreeItem;

export function setSelectedFile(f: vscode.TreeItem){
    selectedFile = f;
    logger.appendLine('setSelectedFile:'+ selectedFile.label)
}

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('Congratulations, your extension "cvs-plugin" is now active!');

    let workspaceRoot :string | undefined = '';
    let folders: File[] = [];
    let extRoot :string | undefined = context.extensionPath;
    let repoName: string = '';
    if (!vscode.workspace.workspaceFolders) {
        workspaceRoot = vscode.workspace.rootPath;
        logger.appendLine('Not workspace');
    }
    else { // TODO: Test
        if(vscode.workspace.workspaceFolders.length > 0) {
            // workspaceRoot = vscode.workspace.workspaceFolders[0].uri.fsPath;
            for(let i = 0; i < vscode.workspace.workspaceFolders.length; i++) {
                logger.appendLine('Workspace folder ' + i + ' , name :' + vscode.workspace.workspaceFolders[i].name);
            }
        }
        else {
            workspaceRoot = vscode.workspace.rootPath;
            logger.appendLine('workspace else');
        }
    }

    if(!workspaceRoot && vscode.workspace.workspaceFolders.length === 0) {
        vscode.window.showErrorMessage('CVS-plugin cannot access correct folder.');
        return;
    }

    let platform = process.platform; //windows: win32, linux: linux, MacOS: darwin
    console.log("OS: ", process.platform);

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

            vscode.window.showInformationMessage("Success");
        });
    }

    let disposable = vscode.commands.registerCommand('cvs-plugin.start', function () {
        // TODO: check env here
        vscode.commands.executeCommand('setContext', 'cvs-plugin.started', true);
        const fp = new FolderProvider(workspaceRoot);
        let files: File[] = [];
        if(workspaceRoot){
            const name = workspaceRoot;
            const uri = workspaceRoot;
            files.push(new File(name, uri, -1));
        }
        else {
            for(let i=0; i<vscode.workspace.workspaceFolders.length; i++) {
                // logger.appendLine('Workspace folder ' + i + ' , name :' + vscode.workspace.workspaceFolders[i].name);
                const name = vscode.workspace.workspaceFolders[i].name;
                const uri = vscode.workspace.workspaceFolders[i].uri;
                files.push(new File(name, uri, -1));
            }
        }
        fp.setData(files);
        const tree = vscode.window.createTreeView('changed-files', {treeDataProvider: fp, showCollapseAll: true});
        tree.onDidChangeSelection( e => setSelectedFile(e.selection[0]) );
    });

    let cvsStatus = vscode.commands.registerCommand('cvs-plugin.status', async function () {

        vscode.window.withProgress({
            location: vscode.ProgressLocation.Window,
            cancellable: false,
            title: 'CVS-plugin is working...'
        }, async progress => {

            // progress.report({ message: '0' });
            if(!workspaceRoot) {
                vscode.window.showErrorMessage('No set cvs root path');
                return;
            }

            const cvs = new CVS(workspaceRoot, platform);
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
                    const nodeProvider = new NodeProvider(workspaceRoot);
                    nodeProvider.setData(files);
                    const tree = vscode.window.createTreeView('changed-files', {treeDataProvider: nodeProvider, showCollapseAll: true });
                    tree.onDidChangeSelection( e => selectedFile = e.selection[0].label);
                }
                else {
                    vscode.window.showErrorMessage('There are no changes.');
                }
            }
        });
        
    });

    let cvsDiff = vscode.commands.registerCommand('cvs-plugin.diff', async function () {
        vscode.window.withProgress({
            location: vscode.ProgressLocation.Window,
            cancellable: false,
            title: 'CVS-plugin is working...'
        }, async progress => {
            if(selectedFile) {
                const cvs = new CVS(workspaceRoot, platform);
                const file = path.join(workspaceRoot, selectedFile);
                const res = await cvs.onGetDiff(selectedFile);
                if (res[0]) {
                    vscode.window.showErrorMessage('Unable to show file changes');
                }
                else {
                    if (res[1]) {
                        const newFile = vscode.Uri.parse('untitled:' + path.join(extRoot, selectedFile + '.tmp'));
                        vscode.workspace.openTextDocument(newFile).then(document => {
                            const edit = new vscode.WorkspaceEdit();
                            edit.insert(newFile, new vscode.Position(0, 0), res[1]);
                            return vscode.workspace.applyEdit(edit).then(success => {
                                if (success) {
                                    vscode.window.showTextDocument(document);
                                } else {
                                    vscode.window.showInformationMessage('Error!');
                                }
                            });
                        });
                    }
                    else {
                        vscode.window.showErrorMessage('Something wrong...');
                    }
                }
            }
            else {
                vscode.window.showErrorMessage('Please select a file to diff.')
            }
        });
    });

    let cmdTest = vscode.commands.registerCommand('cvs-plugin.cmdTest', async function () {
        // const inputCmd :string | undefined = await vscode.window.showInputBox();
        // if(inputCmd)
        //     exeCommand(inputCmd);
        // let uri1 = vscode.Uri.file('C:\\Users\\Chien-Chin Lin\\Documents\\Works\\vscode\\example-ext\\src\\node.ts');
        // let success = await vscode.commands.executeCommand('vscode.openFolder', uri);
        // console.log(uri1);
        // let success = await vscode.commands.executeCommand("vscode.diff", uri1, uri1);
        // WhiteBoard.appendLine("onGetRevision");
        // const cvs = new CVS(workspaceRoot, platform);
        // const res = await cvs.onGetRevision("ChangeLog");
        // WhiteBoard.appendLine("After onGetRevision");
        // if (res[0]) {
        //     // vscode.window.showErrorMessage('Unable to show changes in local copy of repository.');
        //     WhiteBoard.appendLine("1");
        // }
        // else {
        //     if (res[1]) {
        //         WhiteBoard.appendLine("2");
        //         WhiteBoard.appendLine(res[1]);
        //     }
        // }
        // WhiteBoard.show();
    });

    context.subscriptions.push(disposable);
    context.subscriptions.push(cvsStatus);
    context.subscriptions.push(cvsDiff);
}

// this method is called when your extension is deactivated
export function deactivate() {
    console.log('Extension is deactivated');
    vscode.commands.executeCommand('setContext', 'cvs-plugin.started', false);
}

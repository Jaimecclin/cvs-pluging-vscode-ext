// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as cp from 'child_process';
import * as path from 'path';
import * as fs from 'fs';
import * as ps from 'process';

import * as node from './node';
import { CVS } from './cvs'
import { logger } from './log'

let selectedFile: node.FileItem;

export function setSelectedFile(f: node.FileItem){
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
    let extRoot :string = context.extensionPath;
    let filter: Map<string, boolean> = new Map([['changed', true], 
                                                ['updated', false],
                                                ['questionable', false],
                                                ['conflict', true]]);
    const fp = new node.FolderProvider(workspaceRoot, filter);
    let tree: vscode.TreeView<vscode.TreeItem>;

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

    if(!workspaceRoot && vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length === 0) {
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

    let init = vscode.commands.registerCommand('cvs-plugin.start', function () {
        // TODO: check env here
        vscode.commands.executeCommand('setContext', 'cvs-plugin.started', true);
        vscode.commands.executeCommand('setContext', 'cvs-plugin.view_changed_status', filter.get('changed'));
        vscode.commands.executeCommand('setContext', 'cvs-plugin.view_conflict_status', filter.get('conflict'));
        vscode.commands.executeCommand('setContext', 'cvs-plugin.view_updated_status', filter.get('updated'));
        vscode.commands.executeCommand('setContext', 'cvs-plugin.view_questionable_status', filter.get('questionable'));
        
        let folders: node.FileItem[] = [];
        if(workspaceRoot){
            const name = workspaceRoot;
            const uri = vscode.Uri.parse(workspaceRoot);
            folders.push(new node.FolderItem(name, uri));
        }
        else {
            if(vscode.workspace.workspaceFolders)
                for(let i=0; i<vscode.workspace.workspaceFolders.length; i++) {
                    const name = vscode.workspace.workspaceFolders[i].name;
                    const uri = vscode.workspace.workspaceFolders[i].uri;
                    folders.push(new node.FolderItem(name, uri));
                }
        }
        fp.setData(folders);
        tree = vscode.window.createTreeView('changed-files', {treeDataProvider: fp, showCollapseAll: true});
        tree.onDidChangeSelection( e => setSelectedFile(<node.FileItem>(e.selection[0])) );

        // Remove all temporary files
        fs.readdir(path.join(extRoot, 'temporary'), function (err, files) {
            if (err) {
                throw err;
            }
            for( const file of files ) {
                if(file === 'readme.log')
                    continue;
                fs.rm(path.join(extRoot, 'temporary', file), function (err) {
                    if (err) {
                        throw err;
                    }
                });
            }
        });
    });

    let cvsStatus = vscode.commands.registerCommand('cvs-plugin.status', async function () {
        if(!selectedFile){
            vscode.window.showErrorMessage('No selected CVS folder');
            return;
        }
        if(!(selectedFile instanceof node.FolderItem)) {
            vscode.window.showErrorMessage('No selected CVS folder');
            return;
        }

        vscode.window.withProgress({
            location: vscode.ProgressLocation.Window,
            cancellable: false,
            title: 'CVS-plugin is working...'
        }, async progress => {

            // progress.report({ message: '0' });

            const selected: node.FolderItem = selectedFile; 
            const cvs = new CVS(selected.uri.fsPath, platform);
            // TODO: sort the status
            const res = await cvs.onGetStatus();
            
            if (res[0]) {
                vscode.window.showErrorMessage('Unable to show changes in local copy of repository.');
            }
            else {
                if (res[1]) {
                    const regexp = /(?<status>[UMC?]) (?<filename>.+)/;
                    const splited = res[1].split('\n');
                    selected.clear();
                    for(let i=0; i<splited.length; i++){
                        const matched = regexp.exec(splited[i]);
                        
                        if(matched != null && matched.groups){
                            let file: node.FileItem;
                            const filename = matched.groups.filename.trim();
                            const uri = vscode.Uri.parse(filename);
                            if(matched.groups.status === 'M')
                                file = new node.ChangedItem(filename, uri, selected);
                            else if(matched.groups.status === '?')
                                file = new node.QuestionableItem(filename, uri, selected);
                            else if(matched.groups.status === 'U')
                                file = new node.UpdatedItem(filename, uri, selected);
                            else if(matched.groups.status === 'C')
                                file = new node.ConflictItem(filename, uri, selected);
                            else
                                continue;
                            selected.born(file);
                        }
                    }
                    fp.refresh();
                }
                else {
                    vscode.window.showErrorMessage('There are no changes.');
                }
            }
        });
        
    });

    let cvsDiff = vscode.commands.registerCommand('cvs-plugin.diff', async function () {
        if(!selectedFile){
            vscode.window.showErrorMessage('Please select a file to diff.');
            return;
        }
        if(!(selectedFile instanceof node.FileItem)) {
            vscode.window.showErrorMessage('Please select a file to diff.');
            return;
        }

        if(!(selectedFile instanceof node.ChangedItem)) {
            vscode.window.showErrorMessage('Please select a modified file to diff.');
            return;
        }

        vscode.window.withProgress({
            location: vscode.ProgressLocation.Window,
            cancellable: false,
            title: 'CVS-plugin is working...'
        }, async progress => {
            const selected: node.FileItem = selectedFile;
            if(!selected.parent) {
                vscode.window.showErrorMessage('Something wrong...');
                return;
            }
            VsCodeDiff();
        });
    });

    async function CvsDiff() {

    }

    // rev: empty by default, checkout the head version
    async function VsCodeDiff(rev: string="") {
        const selected: node.FileItem = selectedFile;
        if(!selected.parent)
            return;
        const repoRoot = selected.parent.uri.fsPath;
        const selectedPath: string = selected.label;
        const cvs = new CVS(repoRoot, platform);
        const res_co = await cvs.onCheckoutFile(selectedPath, rev);
        if (res_co[0]) {
            vscode.window.showErrorMessage('Fail to checkout file. (Error 1)');
        }
        else {
            const ver = "head"; // current only provide head
            if (res_co[1]) {
                const tempFileName = 'rev-'+ ver + '-' + selectedPath.replace(/\//gi, '-');
                const tempFilePath = path.join(extRoot, 'temporary', tempFileName);
                logger.appendLine('tempFileName:' + tempFileName);
                logger.appendLine('tempFilePath:' + tempFilePath);
                const content = Buffer.from(res_co[1], 'utf8');
                fs.writeFile(tempFilePath, content, function (err) {
                    if (err) {
                        vscode.window.showErrorMessage('Fail to checkout the file to local');
                        throw err;
                    }
                  });
                let uriOrigFile = vscode.Uri.file(tempFilePath);
                let uriCurrFile = vscode.Uri.file(path.join(repoRoot, selectedPath));
                let success = await vscode.commands.executeCommand('vscode.diff', uriOrigFile, uriCurrFile);
            }
            else {
                vscode.window.showErrorMessage('Fail to checkout file. (Error 2)');
            }
        }
    }

    let openFile = vscode.commands.registerCommand('cvs-plugin.openFile', async function () {
        const selected: node.FileItem = selectedFile;
        if(!selected.parent)
            return;
        const repoRoot = selected.parent.uri.fsPath;
        const selectedPath: string = selected.label;
        let uriFilePath = vscode.Uri.file(path.join(repoRoot, selectedPath));
        let success = await vscode.commands.executeCommand('vscode.open', uriFilePath);
    });

    let cvsAnnotate = vscode.commands.registerCommand('cvs-plugin.annotate', async function (fileUrl: vscode.Uri) {
        const uriRepoRoot = vscode.workspace.getWorkspaceFolder(fileUrl);
        if(!uriRepoRoot) {
            vscode.window.showErrorMessage('cvs annotate works in multi-root workspaces only');
            return;
        }
        const repoRoot = uriRepoRoot.uri.fsPath;
        const selectedPath: string = vscode.workspace.asRelativePath(fileUrl.fsPath);
        const cvs = new CVS(repoRoot, platform);
        const res_co = await cvs.onAnnotate(selectedPath);
        if (res_co[0]) {
            vscode.window.showErrorMessage('Fail to annotate this file. Please check the log.');
        }
        else {
            const ver = "head"; // current only provide head
            if (res_co[1]) {
                const tempFileName = 'anno-rev-'+ ver + '-' + selectedPath.replace(/\//gi, '-');
                const tempFilePath = path.join(extRoot, 'temporary', tempFileName);
                logger.appendLine('tempFileName:' + tempFileName);
                logger.appendLine('tempFilePath:' + tempFilePath);
                const content = Buffer.from(res_co[1], 'utf8');
                fs.writeFile(tempFilePath, content, function (err) {
                    if (err) {
                        vscode.window.showErrorMessage('Fail to save the file to local');
                        throw err;
                    }
                  });
                let uriFile = vscode.Uri.file(tempFilePath);
                let success = await vscode.commands.executeCommand('vscode.open', uriFile);
            }
            else {
                vscode.window.showErrorMessage('Fail to annotate this file. (Error 2)');
            }
        }
    });

    let cmdTest = vscode.commands.registerCommand('cvs-plugin.cmdTest', async function () {
        vscode.window.showInformationMessage('Test Command');
    });

    let filterEnableViewChanged = vscode.commands.registerCommand('cvs-plugin.enable_view_changed', async function () {
        filter.set('changed', true);
        fp.refresh();
    });

    let filterDisableViewChanged = vscode.commands.registerCommand('cvs-plugin.disable_view_changed', async function () {
        filter.set('changed', false);
        vscode.commands.executeCommand('setContext', 'cvs-plugin.view_changed_status', false);
        fp.refresh();
    });

    let filterEnableViewConflict = vscode.commands.registerCommand('cvs-plugin.enable_view_conflict', async function () {
        filter.set('conflict', true);
        vscode.commands.executeCommand('setContext', 'cvs-plugin.view_conflict_status', true);
        fp.refresh();
    });

    let filterDisableViewConflict = vscode.commands.registerCommand('cvs-plugin.disable_view_conflict', async function () {
        filter.set('conflict', false);
        vscode.commands.executeCommand('setContext', 'cvs-plugin.view_conflict_status', false);
        fp.refresh();
    });

    let filterEnableViewUpdated = vscode.commands.registerCommand('cvs-plugin.enable_view_updated', async function () {
        filter.set('updated', true);
        vscode.commands.executeCommand('setContext', 'cvs-plugin.view_updated_status', true);
        fp.refresh();
    });

    let filterDisableViewUpdated = vscode.commands.registerCommand('cvs-plugin.disable_view_updated', async function () {
        filter.set('updated', false);
        vscode.commands.executeCommand('setContext', 'cvs-plugin.view_updated_status', false);
        fp.refresh();
    });

    let filterEnableViewQuestionable = vscode.commands.registerCommand('cvs-plugin.enable_view_questionable', async function () {
        filter.set('questionable', true);
        vscode.commands.executeCommand('setContext', 'cvs-plugin.view_questionable_status', true);
        fp.refresh();
    });

    let filterDisableViewQuestionable = vscode.commands.registerCommand('cvs-plugin.disable_view_questionable', async function () {
        filter.set('questionable', false);
        vscode.commands.executeCommand('setContext', 'cvs-plugin.view_questionable_status', false);
        fp.refresh();
    });

    context.subscriptions.push(init);
    context.subscriptions.push(cvsStatus);
    context.subscriptions.push(cvsDiff);
    context.subscriptions.push(cvsAnnotate);
    context.subscriptions.push(filterEnableViewChanged);
    context.subscriptions.push(filterDisableViewChanged);
    context.subscriptions.push(filterEnableViewConflict);
    context.subscriptions.push(filterDisableViewConflict);
    context.subscriptions.push(filterEnableViewUpdated);
    context.subscriptions.push(filterDisableViewUpdated);
    context.subscriptions.push(filterEnableViewQuestionable);
    context.subscriptions.push(filterDisableViewQuestionable);
    context.subscriptions.push(openFile);
    context.subscriptions.push(cmdTest);
}

// this method is called when your extension is deactivated
export function deactivate() {
    console.log('Extension is deactivated');
    vscode.commands.executeCommand('setContext', 'cvs-plugin.started', false);
}

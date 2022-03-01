// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');
const cp = require('child_process')
const path = require('path')
const fs = require("fs");

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed


/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "cvs-plugin" is now active!');

	let rootPath = '';
	if (!vscode.workspace.workspaceFolders) {
		rootPath = vscode.workspace.rootPath;
	}
	else { // TODO: Test
		let root = vscode.workspace.workspaceFolders;
		if (vscode.workspace.workspaceFolders.length === 1) {
			root = vscode.workspace.workspaceFolders[0];
		} else {
			// root = vscode.workspace.getWorkspaceFolder(resource);
		}
		rootPath = root.uri.fsPath;
	}
	const debug = true;

	function exeCommand(command) {
		// Example: command = "powershell ls";
		cp.exec(command, (err, stdout, stderr) => {
			let result = stdout;
			console.log('stdout: ' + stdout);
			console.log('stderr: ' + stderr);
			if (err) {
				console.log('error: ' + err);
				result += stderr;
			}
			// vscode.window.showInformationMessage(result);
			if(debug) {
				const filePath = path.join(rootPath, 'fileName.extension');
				fs.writeFileSync(filePath, result, 'utf8');
		
				const openPath = vscode.Uri.file(filePath);
				vscode.workspace.openTextDocument(openPath).then(doc => {
					vscode.window.showTextDocument(doc);
				});
			}
			
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

	let cvsStatus = vscode.commands.registerCommand('cvs-plugin.status', function () {
		const command = 'powershell cvs status'
		exeCommand(command);;
	});

	let cmdTest = vscode.commands.registerCommand('cvs-plugin.cmdTest', async function () {
		const inputCmd = await vscode.window.showInputBox();
		exeCommand(inputCmd);
	});

	context.subscriptions.push(disposable);
	context.subscriptions.push(cvsStatus);
}



// this method is called when your extension is deactivated
function deactivate() {}

module.exports = {
	activate,
	deactivate
}

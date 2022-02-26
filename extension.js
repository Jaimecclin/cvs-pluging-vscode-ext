// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');
const cp = require('child_process')

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed


function exeCommand(command) {
	// Example: command = "powershell ls";
	cp.exec(command, (err, stdout, stderr) => {
		console.log('stdout: ' + stdout);
		console.log('stderr: ' + stderr);
		if (err) {
			console.log('error: ' + err);
		}
	});
}

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "cvs-plugin" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with  registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('cvs-plugin.helloWorld', function () {
		// The code you place here will be executed every time your command is executed

		// Display a message box to the user
		vscode.window.showInformationMessage('Hello World from CVS-plugin!');
	});

	let cvsStatus = vscode.commands.registerCommand('cvs-plugin.status', function () {
		const command = 'powershell ls'
		exeCommand(command);;
		// vscode.window.showInformationMessage('cvs status from CVS-plugin!' + success);
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

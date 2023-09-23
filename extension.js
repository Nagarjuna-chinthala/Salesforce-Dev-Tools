// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
	let sfTerminal;
	const forceApp = 'force-app';
	const packageFile = 'manifest\\';
	const layoutFile = '\\layouts\\';
	const deployCommand = 'sfdx force:source:deploy ';
	const retrieveCommand = 'sfdx force:source:retrieve ';

	// Deploy file command
	let deployDisposable = vscode.commands.registerCommand('sfdevtools.deployFile', function () {

		var isFileOpen = vscode.window.activeTextEditor;

		// check if the text editor is open or not
		if(isFileOpen){
			// get current file full path
			let currentFilePath = vscode.window.activeTextEditor.document.fileName;
			
			// check if the current file path is force-app 
			if(currentFilePath && (currentFilePath.includes(forceApp) || currentFilePath.includes(packageFile))){
				// build relative file path
				let relativePath;
				let terminalCommand; 
 
				if(currentFilePath.includes(forceApp)){
					// for layouts
					if(currentFilePath.includes(layoutFile)){
						relativePath = currentFilePath.split(layoutFile)[1];
						terminalCommand = deployCommand + '-m '+'"Layout:'+relativePath.substring(0, relativePath.length - 16)+'"';
					}
					// all other components
					else{
						relativePath = forceApp + currentFilePath.split(forceApp)[1];
						terminalCommand = deployCommand+'-p '+relativePath;
					}
				}
				// for package files in manifest folder
				else if(currentFilePath.includes(packageFile)){
					relativePath = packageFile + currentFilePath.split(packageFile)[1];
					terminalCommand = deployCommand+'-x '+relativePath;
				}
				executeCommandInTerminal(terminalCommand);
			}
			else{
				vscode.window.showErrorMessage('This file is not supported to deploy');
			}
		}
		// if text editor not open, the show error message
		else{
			// Display a message box to the user
			vscode.window.showErrorMessage('Open any file to deploy');
		}
	});

	// Retrieve file command
	let retrieveDisposable = vscode.commands.registerCommand('sfdevtools.retrieveFile', function () {
		
		var isFileOpen = vscode.window.activeTextEditor;

		// check if the text editor is open or not
		if(isFileOpen){
			// get current file full path
			let currentFilePath = vscode.window.activeTextEditor.document.fileName;
			
			// check if the current file path is force-app 
			if(currentFilePath && (currentFilePath.includes(forceApp) || currentFilePath.includes(packageFile))){
				// build relative file path
				let relativePath;
				let terminalCommand; 
 
				if(currentFilePath.includes(forceApp)){
					// for layouts
					if(currentFilePath.includes(layoutFile)){
						relativePath = currentFilePath.split(layoutFile)[1];
						terminalCommand = retrieveCommand + '-m '+'"Layout:'+relativePath.substring(0, relativePath.length - 16)+'"';
					}
					// all other components
					else{
						relativePath = forceApp + currentFilePath.split(forceApp)[1];
						terminalCommand = retrieveCommand+'-p '+relativePath;
					}
				}
				// for package files in manifest folder
				else if(currentFilePath.includes(packageFile)){
					relativePath = packageFile + currentFilePath.split(packageFile)[1];
					terminalCommand = retrieveCommand +'-x '+relativePath;
				}
				executeCommandInTerminal(terminalCommand);
			}
			else{
				vscode.window.showErrorMessage('This file is not supported to retrieve');
			}
		}
		// if text editor not open, the show error message
		else{
			// Display a message box to the user
			vscode.window.showErrorMessage('Open any file to retrieve');
		}
	});
	context.subscriptions.push(deployDisposable, retrieveDisposable);

	// to create and execute terminal command
	function executeCommandInTerminal(terminalCommand) {
		
		// if terminal is already there, then don't create new terminal, reuse existing one
		if (sfTerminal === undefined || sfTerminal.exitStatus !==  undefined){
			sfTerminal = vscode.window.createTerminal('SFDevTools');
		}
		
		sfTerminal.show(); 
		sfTerminal.sendText(terminalCommand);
		return sfTerminal;
	}
}

// this method is called when your extension is deactivated
function deactivate() {}

module.exports = {
	activate,
	deactivate
}

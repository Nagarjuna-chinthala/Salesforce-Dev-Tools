// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');
var orgDeployRetrieve = require('./src/orgDeployRetrieve');
var orgWorkspaceColor = require('./src/orgWorkspaceColor');
var lwcHtmlMarkup = require('./src/lwcHtmlMarkup');

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {

	// Deploy file command
	let deployDisposable = vscode.commands.registerCommand('sfdevtools.deployFile', function () {
		orgDeployRetrieve.deploy();
	});

	// Retrieve file command
	let retrieveDisposable = vscode.commands.registerCommand('sfdevtools.retrieveFile', function () {
		orgDeployRetrieve.retrieve();
	});

    // change workspace color
    let changeWorkspaceColor = vscode.commands.registerCommand('sfdevtools.changeWorkspaceColor', function () {
		orgWorkspaceColor.changeWorkspaceColor();
    });

    // reset workspace color
    let changeWorkspaceColorToDefault = vscode.commands.registerCommand('sfdevtools.changeWorkspaceColorDefault', function () {
		orgWorkspaceColor.changeWorkspaceColorToDefault();
    });

	// reset workspace color
    let insertLightningMarkup = vscode.commands.registerCommand('sfdevtools.insertLightningMarkup', function () {
		lwcHtmlMarkup.selectMarkup();
    });

	context.subscriptions.push(
		deployDisposable, 
		retrieveDisposable, 
		changeWorkspaceColor, 
		changeWorkspaceColorToDefault,
		insertLightningMarkup
	);
}

// this method is called when your extension is deactivated
function deactivate(context) {
	//context.subscriptions.push(changeWorkspaceColorToDefault);
}

module.exports = {
	activate,
	deactivate
}

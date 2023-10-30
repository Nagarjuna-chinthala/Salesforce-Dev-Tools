// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');
var orgDeployRetrieve = require('./src/orgDeployRetrieve');
var orgWorkspaceColor = require('./src/orgWorkspaceColor');
var lwcHtmlMarkup = require('./src/lwcHtmlMarkup');
var codeDiagnostics = require('./src/codeDiagnostics');

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

	// todo: creating webview 
    let insertLightningMarkup = vscode.commands.registerCommand('sfdevtools.insertLightningMarkup', function () {
		lwcHtmlMarkup.selectMarkup();
    });

	// Open lwc component library
    let openLwcLibrary = vscode.commands.registerCommand('sfdevtools.openLwcLibrary', function () {
		orgDeployRetrieve.openLwcLibrary();
    });

	// todo: create diagnostics  
	const collection = vscode.languages.createDiagnosticCollection('test');

	if (vscode.window.activeTextEditor) {
		codeDiagnostics.upsertDiagnostics(vscode.window.activeTextEditor.document, collection);
	}
	context.subscriptions.push(vscode.window.onDidChangeActiveTextEditor(editor => {
		if (editor) {
			codeDiagnostics.upsertDiagnostics(editor.document, collection);
		}
	}));

	context.subscriptions.push(
		deployDisposable, 
		retrieveDisposable, 
		changeWorkspaceColor, 
		changeWorkspaceColorToDefault,
		insertLightningMarkup,
		openLwcLibrary
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

// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');
const path = require('path');
var orgDeployRetrieve = require('./src/orgDeployRetrieve');
var orgWorkspaceColor = require('./src/orgWorkspaceColor');
var lwcHtmlMarkup = require('./src/lwcHtmlMarkup');
var codeDiagnostics = require('./src/codeDiagnostics');
var jsonFormatter = require('./src/jsonFormatter');

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {

	// Deploy file command
	let deployDisposable = vscode.commands.registerCommand('sfdevtools.deployFile', function () {
		vscode.window.withProgress({
			location: vscode.ProgressLocation.Notification,
			title: "Deploying current file",
			cancellable: true
			},async (progress, cancelToken) => {
				return await orgDeployRetrieve.deploy(cancelToken);
			});
	});

	// Retrieve file command
	let retrieveDisposable = vscode.commands.registerCommand('sfdevtools.retrieveFile', function () {
		vscode.window.withProgress({
			location: vscode.ProgressLocation.Notification,
			title: "Retrieving current file",
			cancellable: true
			},async (progress, cancelToken) => {
				return await orgDeployRetrieve.retrieve(cancelToken);
			});
	});

	// Retrieve from org
	let retrieveFromOrg = vscode.commands.registerCommand('sfdevtools.retrieveFromOrg', function () {
		vscode.window.withProgress({
			location: vscode.ProgressLocation.Notification,
			title: "Retrieving file",
			cancellable: true
			},async (progress, cancelToken) => {
				return await orgDeployRetrieve.retrieveFileFromOrg(cancelToken);
			});
	});

	// Open current metadata in org 
	let openMetadataInOrg = vscode.commands.registerCommand('sfdevtools.openMetadataInOrg', function () {
		vscode.window.withProgress({
			location: vscode.ProgressLocation.Notification,
			title: "Opening current file in Org",
			cancellable: true
			},async (progress, cancelToken) => {
				return await orgDeployRetrieve.openCurrentFileInOrg(cancelToken);
			});
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

	// Deploy file command
	let formatJson = vscode.commands.registerCommand('sfdevtools.formatJson', function () {
		jsonFormatter.formatJsonData();
	});

	// todo: create diagnostics  
	//const collection = vscode.languages.createDiagnosticCollection('test');

	if (vscode.window.activeTextEditor) {
		//codeDiagnostics.upsertDiagnostics(vscode.window.activeTextEditor.document, collection);
		//codeDiagnostics.findMatch();
	}
	// context.subscriptions.push(vscode.window.onDidChangeActiveTextEditor(editor => {
	// 	if (editor) {
	// 		codeDiagnostics.upsertDiagnostics(editor.document, collection);
	// 	}
	// }));
	function testclose(){
		vscode.window.showErrorMessage('saved');
	}

	var activeEditor = vscode.window.activeTextEditor;
	let document = activeEditor.document;
	var currentlyOpenFilePath = document.fileName;
	var currentlyOpenTabfileName = path.basename(currentlyOpenFilePath);
	let dgCollection = vscode.languages.createDiagnosticCollection(currentlyOpenTabfileName);
	context.subscriptions.push(dgCollection);

	// it will run for switching between tabs 
	context.subscriptions.push(vscode.window.onDidChangeActiveTextEditor((editor) => {
		
		if (editor.document.languageId == 'html'){
			//activeEditor = editor;
			codeDiagnostics.findMatch(activeEditor);
		}
	}));

	// it will run on changes on document 
	context.subscriptions.push(vscode.workspace.onDidChangeTextDocument((editor) => {
		if (editor.document.languageId == 'html'){
           codeDiagnostics.findMatch(activeEditor);
		}
	}));

	// on close document delete diagnostics 
	context.subscriptions.push(vscode.workspace.onDidCloseTextDocument(() => {
           codeDiagnostics.findMatch(activeEditor);
	}));

	context.subscriptions.push(
		deployDisposable, 
		retrieveDisposable, 
		retrieveFromOrg,
		changeWorkspaceColor, 
		changeWorkspaceColorToDefault,
		insertLightningMarkup,
		openLwcLibrary,
		openMetadataInOrg
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

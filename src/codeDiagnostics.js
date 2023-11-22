const vscode = require('vscode');
const path = require('path');
//const diagnostics = require('diagnostics');
const window = vscode.window;

var labels = require('./labels');

let matchWords = ['test'];
const COMMAND = 'code-actions-sample.command';

function findMatch(activeEditor){
	
	// check if the text editor is open or not
    if(activeEditor){
		let document = activeEditor.document;
		var currentlyOpenFilePath = document.fileName;
   		var currentlyOpenTabfileName = path.basename(currentlyOpenFilePath);

		let diagnostics1 = [];
		diagnostics1 = vscode.languages.getDiagnostics(document.uri);
		if(diagnostics1.length){
			diagnostics1.delete();
		}
		let collection = vscode.languages.createDiagnosticCollection(currentlyOpenTabfileName);
		let diagnostics = [];
		//collection.clear();
		
		let textDoc = document.getText();
		let regexFromMyArray = new RegExp(matchWords.join("|"), 'gi');
		let match;

		while (match = regexFromMyArray.exec(textDoc)) {
            var startPos = window.activeTextEditor.document.positionAt(match.index);
            var endPos = window.activeTextEditor.document.positionAt(match.index + match[0].length);
            
            let range =  new vscode.Range(startPos, endPos)

			diagnostics.push({code: '',
							message: 'cannot assign twice to immutable variable `x`',
							range: range,
							severity: vscode.DiagnosticSeverity.Warning,
							source: '',
							relatedInformation: [
								new vscode.DiagnosticRelatedInformation(new vscode.Location(document.uri, new vscode.Range(new vscode.Position(1, 8), new vscode.Position(1, 9))), 'first assignment to `x`')
							]
						});
		}
		collection.set(document.uri, diagnostics);
		// if(!match) {
		// 	collection.clear();
		// }

		
	}
}



function upsertDiagnostics(document, range){
    if (document) {
		const collection = vscode.languages.createDiagnosticCollection('test');
		collection.set(document.uri, [{
			code: '',
			message: 'cannot assign twice to immutable variable `x`',
			range: range,
			severity: vscode.DiagnosticSeverity.Warning,
			source: '',
			relatedInformation: [
				new vscode.DiagnosticRelatedInformation(new vscode.Location(document.uri, new vscode.Range(new vscode.Position(1, 8), new vscode.Position(1, 9))), 'first assignment to `x`')
			]
		}]);
	} 
}

function createFix(document, range, emoji) {
	const fix = new vscode.CodeAction(`Convert to ${emoji}`, vscode.CodeActionKind.QuickFix);
	fix.edit = new vscode.WorkspaceEdit();
	fix.edit.replace(document.uri, new vscode.Range(range.start, range.start.translate(0, 2)), emoji);
	return fix;
}

function createCommand(){
	const action = new vscode.CodeAction('Learn more...', vscode.CodeActionKind.Empty);
	action.command = { command: COMMAND, title: 'Learn more about emojis', tooltip: 'This will open the unicode emoji page.' };
	return action;
}

function deleteDiagnostics(activeEditor){
	let document = activeEditor.document;
	var currentlyOpenFilePath = document.fileName;
	var currentlyOpenTabfileName = path.basename(currentlyOpenFilePath);
	let collection = vscode.languages.createDiagnosticCollection(currentlyOpenTabfileName);
	context.subscriptions.push(collection);


}
// todo: something
// export modules for availability 
module.exports = {
    findMatch,
    upsertDiagnostics,
};
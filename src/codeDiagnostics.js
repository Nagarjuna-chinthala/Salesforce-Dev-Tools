const vscode = require('vscode');
const path = require('path');

var labels = require('./labels');

let matchWords = ['test'];

function findMatch(){
    var regexFromMyArray = new RegExp(matchWords.join("|"), 'gi');
    const string = "I really like Apple phones, they have great apps! Check out this regex: /.+/";

    let result; 
    while (result = regexFromMyArray.exec(string)) {
        console.log(result[0]);
    }

}

function upsertDiagnostics(document, collection){
    if (document) {
		collection.set(document.uri, [{
			code: '',
			message: 'cannot assign twice to immutable variable `x`',
			range: new vscode.Range(new vscode.Position(3, 4), new vscode.Position(3, 10)),
			severity: vscode.DiagnosticSeverity.Warning,
			source: '',
			relatedInformation: [
				new vscode.DiagnosticRelatedInformation(new vscode.Location(document.uri, new vscode.Range(new vscode.Position(1, 8), new vscode.Position(1, 9))), 'first assignment to `x`')
			]
		}]);
	} else {
		collection.clear();
	}
}
// todo: something
// export modules for availability 
module.exports = {
    findMatch,
    upsertDiagnostics,
};
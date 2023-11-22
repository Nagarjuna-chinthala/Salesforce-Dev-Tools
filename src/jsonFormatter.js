const vscode = require('vscode');
const window = vscode.window;
var labels = require('./labels');

function formatJsonData(){
    var isFileOpen = window.activeTextEditor;

    // check if the text editor is open or not
    if(isFileOpen){
        let document = isFileOpen.document;
        let rawJsonData = document.getText();
        if(rawJsonData){
            try{
                let formattedStr = JSON.stringify(JSON.parse(rawJsonData), null, 2);

                isFileOpen.edit(builder => {
                    builder.replace(new vscode.Range(document.lineAt(0).range.start, document.lineAt(document.lineCount - 1).range.end), formattedStr);
                });
                vscode.languages.setTextDocumentLanguage(document, 'json');
            }
            catch(error){
                window.showErrorMessage('JSON Validation Error: '+error.message);
            }
        }else{
            window.showErrorMessage(labels.noDataFound);
        }
    }
    // if text editor not open, the show error message
    else{
        // Display a message box to the user
        window.showErrorMessage(labels.errorOpenFile);
    }
}

// export modules for availability 
module.exports = {
    formatJsonData
};
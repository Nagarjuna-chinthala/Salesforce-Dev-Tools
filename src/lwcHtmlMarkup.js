const vscode = require('vscode');
const window = vscode.window;
const workspace = vscode.workspace;
var labels = require('./labels');

function selectMarkup(){
    var isFileOpen = window.activeTextEditor;

    // check if the text editor is open or not
    if(isFileOpen){

        let panel = vscode.window.createWebviewPanel(
            'lwcLibrary',
            'LWC Component Library',
            vscode.ViewColumn.One,
            {
                enableScripts: true,
                retainContextWhenHidden: true,
                enableCommandUris: true,
            }
        );
        panel.webview.html = `<!DOCTYPE html>
        <html>
        <head>
        </head>
        <body>
        <div class="center_div">
          <h1>LWC Component Library</h1>
          
        </div>
        </body>
        </html>`;
    }
    // if text editor not open, the show error message
    else{
        // Display a message box to the user
        window.showErrorMessage(labels.errorOpenFile);
    }
}

// export modules for availability 
module.exports = {
    selectMarkup
};
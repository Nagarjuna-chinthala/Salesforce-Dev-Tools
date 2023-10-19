const vscode = require('vscode');
const window = vscode.window;
const workspace = vscode.workspace;

var labels = require('./labels');
const forceApp = 'force-app';
const packageFile = 'manifest\\';
const layoutFile = '\\layouts\\';
const deployCommand = 'sfdx force:source:deploy ';
const retrieveCommand = 'sfdx force:source:retrieve ';
let sfTerminal;

function deploy(){
    var isFileOpen = window.activeTextEditor;

    // check if the text editor is open or not
    if(isFileOpen){
        // get current file full path
        let currentFilePath = window.activeTextEditor.document.fileName;
        
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
            window.showErrorMessage(labels.errorFileNotSupport);
        }
    }
    // if text editor not open, the show error message
    else{
        // Display a message box to the user
        window.showErrorMessage(labels.errorOpenFile);
    }
}

function retrieve(){
    var isFileOpen = window.activeTextEditor;

    // check if the text editor is open or not
    if(isFileOpen){
        // get current file full path
        let currentFilePath = window.activeTextEditor.document.fileName;
        
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
            window.showErrorMessage(labels.errorFileNotSupport);
        }
    }
    // if text editor not open, the show error message
    else{
        // Display a message box to the user
        window.showErrorMessage(labels.errorOpenFile);
    }
}

// to create and execute terminal command
function executeCommandInTerminal(terminalCommand) {
    // if terminal is already there, then don't create new terminal, reuse existing one
    if (sfTerminal === undefined || sfTerminal.exitStatus !==  undefined){
        sfTerminal = vscode.window.createTerminal(labels.terminalName);
    }
    
    sfTerminal.show(); 
    sfTerminal.sendText(terminalCommand);
    return sfTerminal;
}
// export modules for availability 
module.exports = {
    deploy,
    retrieve
};
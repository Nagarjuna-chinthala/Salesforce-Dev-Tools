const vscode = require('vscode');
const window = vscode.window;
const workspace = vscode.workspace;
var labels = require('./labels');
var constants = require('./constants');

function changeWorkspaceColor(){
    // check if it is a valid workspace
    if(vscode.workspace.workspaceFolders){
        vscode.window.showQuickPick(Array.from(constants.colorsMap.keys()))
            .then(result =>{
                const newColors = constants.colorsMap.get(result);
                  vscode.workspace.getConfiguration('workbench').update('colorCustomizations', newColors, false);
            });
    }else{
        window.showErrorMessage(labels.errorNotvalidWorkspace);
    }
}

function changeWorkspaceColorToDefault(){
    if(vscode.workspace){
        vscode.workspace.getConfiguration('workbench').update('colorCustomizations', {}, false);
    }else{
        window.showErrorMessage(labels.errorNotvalidWorkspace);
    }
}

// export modules for availability 
module.exports = {
    changeWorkspaceColor,
    changeWorkspaceColorToDefault
};

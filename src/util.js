const vscode = require('vscode');
const window = vscode.window;

// get selected/highlighted text from editor 
function getSelectedText(){
    const editor = window.activeTextEditor;
    const selection = editor.selection;

    if (selection && !selection.isEmpty) {
        const selectionRange = new vscode.Range(selection.start.line, selection.start.character, selection.end.line, selection.end.character);
        const highlighted = editor.document.getText(selectionRange);
        return highlighted;
    }else{
        return;
    }
}

// export modules for availability 
module.exports = {
    getSelectedText
};
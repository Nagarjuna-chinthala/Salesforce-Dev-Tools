const vscode = require('vscode');
const { exec } = require( 'child_process' );
const window = vscode.window;

var util = require('./util');
var constants = require('./constants');

var labels = require('./labels');
const forceApp = 'force-app';
const packageFile = '\\manifest\\';
const layoutFile = '\\layouts\\';
const deployCommand = 'sfdx project deploy start ';
const retrieveCommand = 'sfdx project retrieve start ';
let sfTerminal;
let lwcLibraryHomeUrl = 'https://developer.salesforce.com/docs/component-library/overview/components';
let lwcLibraryBaseUrl = 'https://developer.salesforce.com/docs/component-library/bundle/lightning-';
const outputChannel = vscode.window.createOutputChannel('SF Dev Tools');

async function deploy(cancelToken){
    var isFileOpen = window.activeTextEditor;
    let cancelOperation = false;
    var myPromise = new Promise(async resolve => {
        cancelToken.onCancellationRequested(() => {
			cancelOperation = true;
			return resolve(false);
		});
        try{
            // check if the text editor is open or not
            if(isFileOpen){
                // get current file full path
                let currentFilePath = window.activeTextEditor.document.fileName;
                window.showErrorMessage(currentFilePath);
                // check if the current file path is force-app 
                if(currentFilePath && (currentFilePath.includes(forceApp) || currentFilePath.includes(packageFile))){
                    // build relative file path
                    let relativePath;
                    let terminalCommand; 

                    if(currentFilePath.includes(forceApp)){
                        // for layouts
                        if(currentFilePath.includes(layoutFile)){
                            relativePath = currentFilePath.split(layoutFile)[1];
                            terminalCommand = deployCommand + '--json -c -m '+'"Layout:'+relativePath.substring(0, relativePath.length - 16)+'"';
                        }
                        // all other components
                        else{
                            relativePath = forceApp + currentFilePath.split(forceApp)[1];
                            terminalCommand = deployCommand+'--json -c -d '+relativePath;
                        }
                    }
                    // for package files in manifest folder
                    else if(currentFilePath.includes(packageFile)){
                        relativePath = packageFile + currentFilePath.split(packageFile)[1];
                        terminalCommand = deployCommand+'--json -x '+relativePath;
                    }
                    if(!cancelOperation){
                        await runCommandInTerminal(terminalCommand).then(function(cmdResult){
                            if( cmdResult.status !== 0 ){
                                window.showErrorMessage(labels.deployErrorMsg);
                                outputChannel.appendLine(labels.outputChannelL1);
                                outputChannel.appendLine(labels.outputChannelL2);
                                outputChannel.appendLine(labels.outputChannelL3);
                                cmdResult.result.files.forEach(myError => {
                                    outputChannel.appendLine(myError.type+':'+myError.fullName+'  '+myError.error);
                                });
                                outputChannel.show();	
                                return resolve([]);
                            }else{
                                window.showInformationMessage(labels.deploySuccessMsg);
                                return resolve([]);
                            }
                         });
                    }else{
                        window.showErrorMessage(labels.cancelExecution);
                        return resolve(false);
                    }
                }
                else{
                    window.showErrorMessage(labels.errorFileNotSupport);
                    return resolve(true);
                }
            }
            // if text editor not open, the show error message
            else{
                // Display a message box to the user
                window.showErrorMessage(labels.errorOpenFile);
                return resolve(false);
            }
        }catch(error){
            console.log(labels.logErrorMsg, error);
            return resolve(false);
        }
    });
    return myPromise;
}

async function retrieve(cancelToken){
    var isFileOpen = window.activeTextEditor;

    let cancelOperation = false;
    var myPromise = new Promise(async resolve => {
        cancelToken.onCancellationRequested(() => {
			cancelOperation = true;
			return resolve(false);
		});
        try{
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
                            terminalCommand = retrieveCommand + '--json -c -m '+'"Layout:'+relativePath.substring(0, relativePath.length - 16)+'"';
                        }
                        // all other components
                        else{
                            relativePath = forceApp + currentFilePath.split(forceApp)[1];
                            terminalCommand = retrieveCommand+'--json -c -d '+relativePath;
                        }
                    }
                    // for package files in manifest folder
                    else if(currentFilePath.includes(packageFile)){
                        relativePath = packageFile + currentFilePath.split(packageFile)[1];
                        terminalCommand = retrieveCommand +'--json -x '+relativePath;
                    }
                    //executeCommandInTerminal(terminalCommand);
                    if(!cancelOperation){
                        //executeCommandInTerminal(terminalCommand);
                        await runCommandInTerminal(terminalCommand).then(function(cmdResult){
                            if( cmdResult.status == 0 && cmdResult.result.messages.length){
                                window.showErrorMessage(labels.retrieveErrorMsg);
                                outputChannel.appendLine(labels.outputChannelL1);
                                outputChannel.appendLine(labels.outputChannelL2);
                                outputChannel.appendLine(labels.outputChannelL3);
                                cmdResult.result.files.forEach(myError => {
                                    if(myError.state == 'Failed'){
                                        outputChannel.appendLine(myError.type+':'+myError.fullName+'  '+myError.error);
                                    }
                                });
                                outputChannel.show();	
                                return resolve([]);
                            }else{
                                window.showInformationMessage(labels.retrieveSuccessMsg);
                                return resolve([]);
                            }
                         });
                    }else{
                        window.showErrorMessage(labels.cancelExecution);
                        return resolve(false);
                    }
                }
                else{
                    window.showErrorMessage(labels.errorFileNotSupport);
                    return resolve(true);
                }
            }
            // if text editor not open, the show error message
            else{
                // Display a message box to the user
                window.showErrorMessage(labels.errorOpenFile);
                return resolve(true);
            }
        }catch(error){
            console.log(labels.logErrorMsg, error);
            return resolve(false);
        }
    });
    return myPromise;
}

async function runCommandInTerminal(command){
    return new Promise(resolve=>{
        var outputJson = '';

		if( vscode.workspace.workspaceFolders === undefined ){
			return;
		}
		let sfCommnd = exec( command,{
			maxBuffer: 1024 * 1024 * 6,
			cwd: vscode.workspace.workspaceFolders[0].uri.fsPath
		});

		sfCommnd.stdout.on("data",(dataArg)=> {
			try{
				outputJson += dataArg;
			}
			catch( error ){
				console.log(labels.logErrorMsg, error.message );
			}
		});

		sfCommnd.on('close', (data)=> {
		    return resolve( JSON.parse(outputJson));
		});
    });
}

// to create and execute terminal command
function executeCommandInTerminal(terminalCommand) {
    // if terminal is already there, then don't create new terminal, reuse existing one
    if (sfTerminal === undefined || sfTerminal.exitStatus !==  undefined){
        sfTerminal = window.createTerminal(labels.terminalName);
    }
    
    sfTerminal.show(); 
    sfTerminal.sendText(terminalCommand);
    return sfTerminal;
}

// to open selected lwc component in browser 
function openLwcLibrary(){
    let selectedText = util.getSelectedText();

    if(selectedText){
        vscode.env.openExternal(vscode.Uri.parse(lwcLibraryBaseUrl+selectedText));
    }else{
        vscode.env.openExternal(vscode.Uri.parse(lwcLibraryHomeUrl));
    }
}

async function retrieveFileFromOrg(cancelToken){
    let cancelOperation = false;
    var myPromise = new Promise(async resolve => {
        cancelToken.onCancellationRequested(() => {
			cancelOperation = true;
			return resolve(false);
		});
        try{
            // check if it is a valid workspace
            if(vscode.workspace.workspaceFolders){
                // show picker to choose metadata type
                window.showQuickPick(Array.from(constants.packageMetadataMap.keys()),{
                    placeHolder: labels.mdTypePlaceHolder
                }).then(async result =>{
                        const selectedMetadata = constants.packageMetadataMap.get(result);
                        if(selectedMetadata){
                            window.showInputBox({
                                placeHolder: labels.mdNamePlaceHolder,
                            }).then(async inputText =>{
                                let terminalCommand = retrieveCommand+' --json --metadata '+selectedMetadata+':'+inputText;
                                if(!cancelOperation && inputText){
                                    await runCommandInTerminal(terminalCommand).then(function(cmdResult){
                                        if( cmdResult.status == 0 && cmdResult.result.messages.length){
                                            window.showErrorMessage(labels.retrieveErrorMsg);
                                            outputChannel.appendLine(labels.outputChannelL1);
                                            outputChannel.appendLine(labels.outputChannelL2);
                                            outputChannel.appendLine(labels.outputChannelL3);
                                            cmdResult.result.files.forEach(myError => {
                                                if(myError.state == 'Failed'){
                                                    outputChannel.appendLine(myError.type+':'+myError.fullName+'  '+myError.error);
                                                }
                                            });
                                            outputChannel.show();	
                                            return resolve([]);
                                        }else{
                                            window.showInformationMessage(labels.retrieveSuccessMsg);
                                            return resolve([]);
                                        }
                                     });
                                }else{
                                    window.showErrorMessage(labels.cancelExecution);
                                    return resolve(false);
                                }
                            });
                        }else{
                            window.showErrorMessage(labels.cancelExecution);
                            return resolve(false);
                        }
                    });
            }else{
                window.showErrorMessage(labels.errorNotvalidWorkspace);
                return resolve(false);
            }
        }catch(error){
            console.log(labels.logErrorMsg, error);
            return resolve(false);
        }
    });
    return myPromise;
}

// export modules for availability 
module.exports = {
    deploy,
    retrieve,
    retrieveFileFromOrg,
    openLwcLibrary
};
const vscode = require('vscode');
const path = require('path');
const { exec } = require( 'child_process' );
const window = vscode.window;

var util = require('./util');
var constants = require('./constants');

var labels = require('./labels');
const { resourceLimits } = require('worker_threads');
const forceApp = 'force-app';
const packageFile = 'manifest';
const layoutFile = 'layouts';
const deployCommand = 'sfdx project deploy start ';
const retrieveCommand = 'sfdx project retrieve start ';
const orgOpenCommand = 'sfdx force org open --json -p';
const soqlQueryCommand = 'sfdx force:data:soql:query --json -t -q ';

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
                // check if the current file path is force-app 
                if(currentFilePath && vscode.workspace.name){
                    // build relative file path
                    let projectName = vscode.workspace.name;
                    let relativePath = currentFilePath.split(projectName)[1].slice(1);
                    let terminalCommand; 

                    // for layouts
                    if(relativePath.includes(layoutFile)){
                        terminalCommand = deployCommand + '--json -c -d '+relativePath.split(layoutFile)[0]+layoutFile+'/"'+relativePath.split(layoutFile)[1].slice(1)+'"';
                    }
                    // for package files in manifest folder
                    else if(relativePath.includes(packageFile)){
                        terminalCommand = deployCommand+'--json -x '+relativePath;
                    }// all other components
                    else{
                        terminalCommand = deployCommand+'--json -c -d '+relativePath;
                    }
                    
                    if(!cancelOperation && terminalCommand){
                        await runCommandInTerminal(terminalCommand).then(function(cmdResult){
                            processResultsOnDeploy(cmdResult).then(function(){
                                return resolve(true);
                            });
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
                if(currentFilePath && vscode.workspace.name){
                    // build relative file path
                    let projectName = vscode.workspace.name;
                    let relativePath = currentFilePath.split(projectName)[1].slice(1);
                    let terminalCommand; 

                    // for layouts
                    if(relativePath.includes(layoutFile)){
                        terminalCommand = retrieveCommand + '--json -c -d '+relativePath.split(layoutFile)[0]+layoutFile+'/"'+relativePath.split(layoutFile)[1].slice(1)+'"';
                    }
                    // for package files in manifest folder
                    else if(relativePath.includes(packageFile)){
                        terminalCommand = retrieveCommand+'--json -x '+relativePath;
                    }// all other components
                    else{
                        terminalCommand = retrieveCommand+'--json -c -d '+relativePath;
                    }
                    
                    //executeCommandInTerminal(terminalCommand);
                    if(!cancelOperation && terminalCommand){
                        //executeCommandInTerminal(terminalCommand);
                        await runCommandInTerminal(terminalCommand).then(function(cmdResult){
                            processResultsOnRetrieve(cmdResult).then(function(){
                                return resolve(true);
                            });
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

async function processResultsOnDeploy(cmdResult){
    return new Promise(resolve =>{
        if( cmdResult.status !== 0){
            window.showErrorMessage(labels.deployErrorMsg);
            outputChannel.appendLine('');// add line break
            outputChannel.appendLine(labels.outputChannelErrorL1);
            if(cmdResult.result){
                outputChannel.appendLine(labels.outputChannelErrorL2);
                outputChannel.appendLine(labels.outputChannelErrorL3);
                cmdResult.result.files.forEach(myError => {
                    outputChannel.appendLine(myError.type+':'+myError.fullName+'  '+myError.error);
                });
                outputChannel.appendLine(labels.completedExecution+cmdResult.result.completedDate);
            }else if(cmdResult.message){
                outputChannel.appendLine(cmdResult.message);
            }else{
                outputChannel.appendLine(cmdResult);
            }
            outputChannel.show();	
            return resolve(true);
        }else if(cmdResult.status == 0){
            window.showInformationMessage(labels.deploySuccessMsg);
            outputChannel.appendLine('');// add line break
            outputChannel.appendLine(labels.outputChannelSuccessL1);
            outputChannel.appendLine(labels.outputChannelSuccessL2);
            outputChannel.appendLine(labels.outputChannelSuccessL3);
            
            if(cmdResult.result){
                cmdResult.result.details.componentSuccesses.forEach(result => {
                    if(result.componentType){
                        outputChannel.appendLine(result.componentType+':'+result.fullName);
                    }
                });
            }
            outputChannel.appendLine(labels.completedExecution+cmdResult.result.completedDate);
            return resolve(true);
        }
    });
}

async function processResultsOnRetrieve(cmdResult){
    return new Promise(resolve =>{
        // if its failed, handle errors 
        if( cmdResult.status != 0){
            window.showErrorMessage(labels.retrieveErrorMsg);
            outputChannel.appendLine('');// add line break
            outputChannel.appendLine(labels.outputChannelErrorL1);
            outputChannel.appendLine(labels.outputChannelSuccessL2);
            outputChannel.appendLine(labels.outputChannelSuccessL3);
            if(cmdResult.message){
                outputChannel.appendLine('ERROR: '+cmdResult.message);
            }else{
                outputChannel.appendLine(labels.logErrorMsg);
            }
            outputChannel.show();	
            return resolve([]);
        }// success
        else{
            // partila success, we consider as a error
            if(cmdResult.result.messages.length){
                window.showErrorMessage(labels.retrieveErrorMsg);
                outputChannel.appendLine('');// add line break
                outputChannel.appendLine(labels.outputChannelErrorL1);
                outputChannel.appendLine(labels.outputChannelSuccessL2);
                outputChannel.appendLine(labels.outputChannelSuccessL3);
                if(cmdResult.result.messages){
                    cmdResult.result.messages.forEach(result => {
                        outputChannel.appendLine('ERROR: '+ result.problem);
                    });
                }
                outputChannel.show();
            }else{
                window.showInformationMessage(labels.retrieveSuccessMsg);
                outputChannel.appendLine('');// add line break
                outputChannel.appendLine(labels.outputChannelSuccessL1);
                outputChannel.appendLine(labels.outputChannelSuccessL2);
                outputChannel.appendLine(labels.outputChannelSuccessL3);
               
                if(cmdResult.result){
                    cmdResult.result.fileProperties.forEach(result => {
                        if(result.id){
                            outputChannel.appendLine(result.type+':'+result.fullName);
                        }
                    });
                }
            }
            
            return resolve(true);
        }
    });
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

async function openCurrentFileInOrg(cancelToken){
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
                let fileName,fileExtension,fileNamesList;

                if( currentFilePath.includes('\\') ){
                    fileNamesList = currentFilePath.substring(currentFilePath.lastIndexOf('\\') + 1).split('.');
                }
                else{
                    fileNamesList = currentFilePath.substring(currentFilePath.lastIndexOf('/') + 1).split('.');
                }
                if( fileNamesList.length > 3 ){
                    fileName = fileNamesList[1];
                    fileExtension = fileNamesList[2];
                }
                else{
                    fileName = fileNamesList[0];
                    fileExtension = fileNamesList[1];
                }
                
                // check if the current file path is force-app 
                if(currentFilePath && fileName && fileExtension && constants.FILE_EXTENSION_MAP.has(fileExtension)){
                    // build relative file path

                    let terminalCommand;
                    let pathDetails = constants.FILE_EXTENSION_MAP.get(fileExtension); 
                    // its a standard object
                    if(fileExtension == 'object-meta'){
                        if(!fileName.includes('__c')){
                            terminalCommand = orgOpenCommand + pathDetails.url.replace(pathDetails.replaceKey,fileName);
                        }else{
                            fileName = fileName.split('__')[0];
                        }
                    } 

                    if(!cancelOperation && !terminalCommand){
                        let queryString = "\"Select Id From "+pathDetails.metadataType+" Where "+pathDetails.whereField+" = "+"\'"+fileName+"\'"+" LIMIT 1\"";
                        var soqlQuery = soqlQueryCommand+queryString;

                        await runCommandInTerminal( soqlQuery).then(async function( soqlData ){
                            // print errors on output panel 
                            if( soqlData.status !== 0 ){
                                window.showErrorMessage(labels.soqlErrorMsg);
                                outputChannel.appendLine( soqlData.message );
                                outputChannel.show();	
                                return resolve([]);
                            }

                            //Raising error if no data returned.
                            if( soqlData.result.records === undefined || soqlData.result.records.length === 0 ){
                                window.showErrorMessage(labels.soqlErrorNoDataMsg);
                                return resolve([]);
                            }

                            let metaDataId = soqlData.result.records[0].Id;
                            terminalCommand = orgOpenCommand + pathDetails.url.replace(pathDetails.replaceKey,metaDataId);
                        });
                    }
                    
                    if(!cancelOperation && terminalCommand){
                        await runCommandInTerminal(terminalCommand).then(function(cmdResult){
                            // if having any errors
                            if( cmdResult.status !== 0){
                                window.showErrorMessage(labels.logErrorMsg);	
                                return resolve([]);
                            }else{// on success
                                window.showInformationMessage(labels.openInOrgSuccessMsg);
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
// export modules for availability 
module.exports = {
    deploy,
    retrieve,
    retrieveFileFromOrg,
    openLwcLibrary,
    openCurrentFileInOrg
};
const vscode = require('vscode');
const path = require('path');
const { exec } = require( 'child_process' );
const window = vscode.window;

var util = require('./util');
var constants = require('./constants');

var labels = require('./labels');
const { resourceLimits } = require('worker_threads');
const packageFile = 'manifest';
const layoutFile = 'layouts';

const userConfigCmd = vscode.workspace.getConfiguration().get('salesforceDevTools.salesforceCommandToUse');
const userConfigFormat = vscode.workspace.getConfiguration().get('salesforceDevTools.sfCommandOutputFormat');

const orgOpenCommand = userConfigCmd +' org open --json -p';
const soqlQueryCommand = userConfigCmd +' data query --json -t -q ';
const cmdFlag = '--json -c -d ';
const cmdFlagForTerminal = '-c -d ';
const packageCmdFlag = '--json -x ';
const packageCmdFlagForTerminal = '-x ';

const userSelectedCmdFlag = userConfigFormat =='Progress View' ? cmdFlag: cmdFlagForTerminal;
const userSelectedCmdFlagForPkg = userConfigFormat =='Progress View' ? packageCmdFlag: packageCmdFlagForTerminal;

const deployCommand = userConfigCmd +' project deploy start ';
const retrieveCommand = userConfigCmd +' project retrieve start ';
const RUN_APEX_TEST_CMD = userConfigCmd +' apex test run ';

let sfTerminal;
let lwcLibraryHomeUrl = 'https://developer.salesforce.com/docs/component-library/overview/components';
let lwcLibraryBaseUrl = 'https://developer.salesforce.com/docs/component-library/bundle/lightning-';
const outputChannel = vscode.window.createOutputChannel('SF Dev Tools');

function deploy(){
    var isFileOpen = window.activeTextEditor;
    let cancelOperation = false;

    try{
        // check if the text editor is open or not
        if(isFileOpen){
            // get current file full path
            let currentFilePath = window.activeTextEditor.document.fileName;
            // check if the current file path is force-app 
            if(currentFilePath && vscode.workspace.name){
                // build relative file path
                let projectName = vscode.workspace.name;
                let terminalCommand; 

                // for package files in manifest folder
                if(currentFilePath.includes(packageFile)){
                    terminalCommand = deployCommand + userSelectedCmdFlagForPkg + '"'+currentFilePath+'"';
                }// all other components
                else{
                    terminalCommand = deployCommand + userSelectedCmdFlag + '"'+currentFilePath+'"';
                }

                if(userConfigFormat === 'Progress View'){
                    vscode.window.withProgress({
                        location: vscode.ProgressLocation.Notification,
                        title: "Deploying current file",
                        cancellable: true
                        },async (progress, cancelToken) => {
                            var myPromise = new Promise(async resolve => {
                                cancelToken.onCancellationRequested(() => {
                                    window.showErrorMessage(labels.cancelExecution);
                                    cancelOperation = true;
                                    return resolve(false);
                                });
                            
                            if(!cancelOperation){
                                await runCommandInTerminal(terminalCommand).then(function(cmdResult){
                                    processResultsOnDeploy(cmdResult).then(function(){
                                        return resolve(true);
                                    });
                                });
                            }
                        });
                        return myPromise;
                    });
                }else if(userConfigFormat === 'Terminal View'){
                    executeCommandInTerminal(terminalCommand);
                }
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
    }catch(error){
        console.log(labels.logErrorMsg, error);
    }
}

function retrieve(){
    var isFileOpen = window.activeTextEditor;
    let cancelOperation = false;

    try{
        // check if the text editor is open or not
        if(isFileOpen){
            // get current file full path
            let currentFilePath = window.activeTextEditor.document.fileName;
            
            // check if the current file path is force-app 
            if(currentFilePath && vscode.workspace.name){
                let terminalCommand; 

                // for package files in manifest folder
                if(currentFilePath.includes(packageFile)){
                    terminalCommand = retrieveCommand+userSelectedCmdFlagForPkg + '"'+currentFilePath+'"';
                }// all other components
                else{
                    terminalCommand = retrieveCommand + userSelectedCmdFlag + '"'+currentFilePath+'"';
                }
                if(userConfigFormat === 'Progress View'){
                    vscode.window.withProgress({
                        location: vscode.ProgressLocation.Notification,
                        title: "Retrieving current file",
                        cancellable: true
                        },async (progress, cancelToken) => {
                            var myPromise = new Promise(async resolve => {
                                cancelToken.onCancellationRequested(() => {
                                    window.showErrorMessage(labels.cancelExecution);
                                    cancelOperation = true;
                                    return resolve(false);
                                });
                            
                            if(!cancelOperation){
                                await runCommandInTerminal(terminalCommand).then(function(cmdResult){
                                    processResultsOnRetrieve(cmdResult).then(function(){
                                        return resolve(true);
                                    });
                                });
                            }
                        });
                        return myPromise;
                    })
                }else if(userConfigFormat === 'Terminal View'){
                    executeCommandInTerminal(terminalCommand);
                }
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
    }catch(error){
        console.log(labels.logErrorMsg, error);
    }
}

async function processResultsOnDeploy(cmdResult){
    return new Promise(resolve =>{
        if( cmdResult.status !== 0){
            window.showErrorMessage(labels.deployErrorMsg);
            outputChannel.appendLine('');// add line break
            outputChannel.appendLine(labels.opcDeployFailed);
            //outputChannel.appendLine('');// add line break
            if(cmdResult.hasOwnProperty('result') && cmdResult.result.details.componentFailures.length){
                let resultSummary = { col1: ["File Type", "---------"], col2: ["File Name", "---------"], col3: ["Errors", "------"]};
                cmdResult.result.details.componentFailures.forEach(myError => {
                    resultSummary.col1.push(myError.componentType);
                    resultSummary.col2.push(myError.fullName);
                    let compError = myError.success === false ? myError.problem : ' ';
                    resultSummary.col3.push(compError);
                });
                formatResultsData(resultSummary).then(function(formattedResults){
                    for(let i=0; i<resultSummary.col1.length; i++){
                        outputChannel.appendLine(formattedResults.col1[i]+'  '+formattedResults.col2[i]+'  '+formattedResults.col3[i]);
                    }
                    outputChannel.appendLine('');// add line break
                    outputChannel.appendLine(labels.completedExecution+cmdResult.result.completedDate);
                });
                
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
            outputChannel.appendLine(labels.opcDeploySuccess);
            //outputChannel.appendLine('');// add line break
            
            if(cmdResult.result){
                let resultSummary = { col1: ["File Type", "---------"], col2: ["File Name", "---------"]};
                cmdResult.result.details.componentSuccesses.forEach(result => {
                    if(result.componentType){
                        resultSummary.col1.push(result.componentType);
                        resultSummary.col2.push(result.fullName);
                    }
                });

                formatResultsData(resultSummary).then(function(formattedResults){
                    for(let i=0; i<resultSummary.col1.length; i++){
                        outputChannel.appendLine(formattedResults.col1[i]+'  '+formattedResults.col2[i]);
                    }
                    outputChannel.appendLine('');// add line break
                    outputChannel.appendLine(labels.completedExecution+cmdResult.result.completedDate);
                });
            }
            
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
            outputChannel.appendLine(labels.opcRetrieveFailed);
            //outputChannel.appendLine('');// add line break

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
                outputChannel.appendLine('');// add line break
                outputChannel.appendLine(labels.opcRetrieveFailed);
                //outputChannel.appendLine('');// add line break
                if(cmdResult.result.messages){
                    cmdResult.result.messages.forEach(result => {
                        outputChannel.appendLine('ERROR: '+ result.problem);
                    });
                }
                outputChannel.show();
            }else{
                window.showInformationMessage(labels.retrieveSuccessMsg);
                outputChannel.appendLine('');// add line break
                outputChannel.appendLine(labels.opcRetrieveSuccess);
                //outputChannel.appendLine('');// add line break
                let resultSummary = { col1: ["File Type", "---------"], col2: ["File Name", "---------"], col3: ["Last Modified By Name", "---------------------"], col4: ["Last Modified Date", "------------------"]};
                if(cmdResult.result){
                    cmdResult.result.fileProperties.forEach(result => {
                        if(result.id){
                            resultSummary.col1.push(result.type);
                            resultSummary.col2.push(result.fullName);
                            resultSummary.col3.push(result.lastModifiedByName);
                            resultSummary.col4.push(result.lastModifiedDate);
                        }
                    });
                }
                formatResultsData(resultSummary).then(function(formattedResults){
                    for(let i=0; i<resultSummary.col1.length; i++){
                        outputChannel.appendLine(formattedResults.col1[i]+'  '+formattedResults.col2[i]+'  '+formattedResults.col3[i]+'  '+formattedResults.col4[i]);
                    }
                });
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
                                inputText = selectedMetadata == 'Layout' ? `"${inputText}"`: inputText;
                                let terminalCommand = retrieveCommand+' --json --metadata '+selectedMetadata+':'+inputText;
                                if(!cancelOperation && inputText){
                                     await runCommandInTerminal(terminalCommand).then(function(cmdResult){
                                        processResultsOnRetrieve(cmdResult).then(function(){
                                            return resolve(true);
                                        });
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

function deployFolder(folderPath){
    let cancelOperation = false;

    try{
        // check if the current file path is force-app 
        if(vscode.workspace.name && folderPath){

            let terminalCommand = deployCommand + userSelectedCmdFlag + '"'+folderPath+'"';

            if(userConfigFormat === 'Progress View'){
                vscode.window.withProgress({
                    location: vscode.ProgressLocation.Notification,
                    title: "Deploying folder to org",
                    cancellable: true
                    },async (progress, cancelToken) => {
                        var myPromise = new Promise(async resolve => {
                            cancelToken.onCancellationRequested(() => {
                                window.showErrorMessage(labels.cancelExecution);
                                cancelOperation = true;
                                return resolve(false);
                            });
                        
                        if(!cancelOperation){
                            await runCommandInTerminal(terminalCommand).then(function(cmdResult){
                                processResultsOnDeploy(cmdResult).then(function(){
                                    return resolve(true);
                                });
                            });
                        }
                    });
                    return myPromise;
                });
            }else if(userConfigFormat === 'Terminal View'){
                executeCommandInTerminal(terminalCommand);
            }
        }
        else{
            window.showErrorMessage(labels.errorFileNotSupport);
        }
    }catch(error){
        console.log(labels.logErrorMsg, error);
    }
}

function retrieveFolder (folderPath){
    let cancelOperation = false;

    try{
        // check if the current file path is force-app 
        if(vscode.workspace.name && folderPath){
            let terminalCommand = retrieveCommand + userSelectedCmdFlag + '"'+folderPath+'"';

            if(userConfigFormat === 'Progress View'){
                vscode.window.withProgress({
                    location: vscode.ProgressLocation.Notification,
                    title: "Retrieving folder from org",
                    cancellable: true
                    },async (progress, cancelToken) => {
                        var myPromise = new Promise(async resolve => {
                            cancelToken.onCancellationRequested(() => {
                                window.showErrorMessage(labels.cancelExecution);
                                cancelOperation = true;
                                return resolve(false);
                            });
                        
                        if(!cancelOperation){
                            await runCommandInTerminal(terminalCommand).then(function(cmdResult){
                                processResultsOnRetrieve(cmdResult).then(function(){
                                    return resolve(true);
                                });
                            });
                        }
                    });
                    return myPromise;
                });
            }else if(userConfigFormat === 'Terminal View'){
                executeCommandInTerminal(terminalCommand);
            }
        }
        else{
            window.showErrorMessage(labels.errorFileNotSupport);                
        }
    }catch(error){
        console.log(labels.logErrorMsg, error);
    }
}

async function runApexTestClass(cancelToken){
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
                    let methodName = util.getSelectedText(); // if user wants to run a single method
                    let className = path.basename(currentFilePath).split('.')[0];

                    let clsOrMethodName = methodName != undefined ? className+'.'+methodName : className;
                    let clsOrMethodFlag = methodName != undefined ? '--tests ' : '-n ';
                    let terminalCommand = RUN_APEX_TEST_CMD + clsOrMethodFlag +clsOrMethodName+' -c -r json --synchronous';
                    
                    //executeCommandInTerminal(terminalCommand);
                    if(!cancelOperation && terminalCommand){                        
                        await runCommandInTerminal(terminalCommand).then(function(cmdResult){
                            processApexTestResults(cmdResult).then(function(something){
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

async function processApexTestResults(cmdResult){
    return new Promise(resolve =>{
        let uncoveredLines = []; 
        if( cmdResult.result.summary.outcome == 'Failed'){
            window.showErrorMessage(labels.semTestClassFailed);
            outputChannel.appendLine('');// add line break
            outputChannel.appendLine(labels.opcTestResults);
            outputChannel.appendLine('Result:                      '+cmdResult.result.summary.outcome);
            outputChannel.appendLine('Test Coverage:               '+ cmdResult.result.summary.testRunCoverage);
            outputChannel.appendLine('No of Test methods failed:   '+ cmdResult.result.summary.failing);
            outputChannel.appendLine('No of lines covered:         '+ cmdResult.result.coverage.coverage[0].totalCovered);
            outputChannel.appendLine('Total lines:                 '+ cmdResult.result.coverage.coverage[0].totalLines);
            Object.entries(cmdResult.result.coverage.coverage[0].lines).forEach(([key, value]) => {
                if(!value){
                    uncoveredLines.push(key);
                }
              });
            outputChannel.appendLine('Uncovered lines:             '+ uncoveredLines.toString());
            outputChannel.appendLine('');// add line break

            let resultSummary = { col1: ["Method Name", "-----------"], col2: ["Result", "------"], col3: ["Errors", "------"]};
            cmdResult.result.tests.forEach(record => {
                if(record.Outcome == 'Fail'){
                    resultSummary.col1.push(record.MethodName);
                    resultSummary.col2.push(record.Outcome);
                    resultSummary.col3.push(record.StackTrace);

                    resultSummary.col1.push("   ");
                    resultSummary.col2.push("   ");
                    resultSummary.col3.push(record.Message);
                }else{
                    resultSummary.col1.push(record.MethodName);
                    resultSummary.col2.push(record.Outcome);
                    resultSummary.col3.push("   ");
                }
            });
            formatResultsData(resultSummary).then(function(formattedResults){
                for(let i=0; i<resultSummary.col1.length; i++){
                    outputChannel.appendLine(formattedResults.col1[i]+'  '+formattedResults.col2[i]+'  '+formattedResults.col3[i]);
                }
            });
            outputChannel.show();
            return resolve(true);
        }else if(cmdResult.result.summary.outcome == 'Passed'){
            if(cmdResult.result.tests.length){
                window.showInformationMessage(labels.simTestClassPassed);
                outputChannel.appendLine('');// add line break
                outputChannel.appendLine(labels.opcTestResults);
                outputChannel.appendLine('Result:                '+cmdResult.result.summary.outcome);
                outputChannel.appendLine('Test Coverage:         '+ cmdResult.result.summary.testRunCoverage);
                outputChannel.appendLine('No of lines covered:   '+ cmdResult.result.coverage.summary.coveredLines);
                outputChannel.appendLine('Total lines:           '+ cmdResult.result.coverage.summary.totalLines);
                outputChannel.appendLine('Class Name:            '+ cmdResult.result.coverage.coverage[0].name);
                Object.entries(cmdResult.result.coverage.coverage[0].lines).forEach(([key, value]) => {
                    if(!value){
                        uncoveredLines.push(key);
                    }
                  });
                outputChannel.appendLine('Uncovered lines:       '+ uncoveredLines.toString());
    
                outputChannel.appendLine('');// add line break
                let resultSummary = { col1: ["Method Name", "-----------"], col2: ["Result", "------"]};
                cmdResult.result.tests.forEach(record => {
                    resultSummary.col1.push(record.MethodName);
                    resultSummary.col2.push(record.Outcome);
                });
    
                formatResultsData(resultSummary).then(function(formattedResults){
                    for(let i=0; i<resultSummary.col1.length; i++){
                        outputChannel.appendLine(formattedResults.col1[i]+'  '+formattedResults.col2[i]);
                    }
                });
                outputChannel.show();
                return resolve(true);
            }else{
                window.showErrorMessage(labels.semNotValidTestClass);
                return resolve(true);
            }
        }
    });
}

async function formatResultsData(results){
    return new Promise(resolve =>{
        for (const [key, value] of Object.entries(results)) {
            let stringLen = value.reduce((a, b) => a.length <= b.length ? b : a).length + 2;
            const newArr = value.map((string) => string+' '.repeat(stringLen - string.length));
            results[key] = newArr;
        }
        return resolve(results);
    })
}

module.exports = {
    deploy,
    retrieve,
    retrieveFileFromOrg,
    openLwcLibrary,
    openCurrentFileInOrg,
    deployFolder,
    retrieveFolder,
    runApexTestClass
};
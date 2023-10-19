const vscode = require('vscode');
const window = vscode.window;
const workspace = vscode.workspace;
var labels = require('./labels');

const colorsMap = new Map([
    ['Salesforce Blue', {
        'activityBar.activeBackground': '#72b3f5',
        'activityBar.background': '#72b3f5',
        'activityBar.foreground': '#15202b',
        'activityBar.inactiveForeground': '#15202b99',
        'activityBarBadge.background': '#d00f6f',
        'activityBarBadge.foreground': '#e7e7e7',
        'commandCenter.border': '#15202b99',
        'sash.hoverBorder': '#72b3f5',
        'statusBar.background': '#4399f1',
        'statusBar.foreground': '#15202b',
        'statusBarItem.hoverBackground': '#147fed',
        'statusBarItem.remoteBackground': '#4399f1',
        'statusBarItem.remoteForeground': '#15202b',
        'titleBar.activeBackground': '#4399f1',
        'titleBar.activeForeground': '#15202b',
        'titleBar.inactiveBackground': '#4399f199',
        'titleBar.inactiveForeground': '#15202b99'
    }],
    ['Red', {
        'activityBar.activeBackground': '#fa3f4f',
        'activityBar.background': '#fa3f4f',
        'activityBar.foreground': '#e7e7e7',
        'activityBar.inactiveForeground': '#e7e7e799',
        'activityBarBadge.background': '#0a5d02',
        'activityBarBadge.foreground': '#e7e7e7',
        'commandCenter.border': '#e7e7e799',
        'sash.hoverBorder': '#fa3f4f',
        'statusBar.background': '#f90d21',
        'statusBar.foreground': '#e7e7e7',
        'statusBarItem.hoverBackground': '#fa3f4f',
        'statusBarItem.remoteBackground': '#f90d21',
        'statusBarItem.remoteForeground': '#e7e7e7',
        'titleBar.activeBackground': '#f90d21',
        'titleBar.activeForeground': '#e7e7e7',
        'titleBar.inactiveBackground': '#f90d2199',
        'titleBar.inactiveForeground': '#e7e7e799'
    }],
    ['Magenta', {
        'activityBar.activeBackground': '#d472c0',
        'activityBar.background': '#d472c0',
        'activityBar.foreground': '#15202b',
        'activityBar.inactiveForeground': '#15202b99',
        'activityBarBadge.background': '#d3e19d',
        'activityBarBadge.foreground': '#15202b',
        'commandCenter.border': '#e7e7e799',
        'sash.hoverBorder': '#d472c0',
        'statusBar.background': '#c84baf',
        'statusBar.foreground': '#e7e7e7',
        'statusBarItem.hoverBackground': '#d472c0',
        'statusBarItem.remoteBackground': '#c84baf',
        'statusBarItem.remoteForeground': '#e7e7e7',
        'titleBar.activeBackground': '#c84baf',
        'titleBar.activeForeground': '#e7e7e7',
        'titleBar.inactiveBackground': '#c84baf99',
        'titleBar.inactiveForeground': '#e7e7e799'
    }],
    ['Light Green', {
        'activityBar.activeBackground': '#28bea6',
        'activityBar.background': '#28bea6',
        'activityBar.foreground': '#15202b',
        'activityBar.inactiveForeground': '#15202b99',
        'activityBarBadge.background': '#b82cd3',
        'activityBarBadge.foreground': '#e7e7e7',
        'commandCenter.border': '#e7e7e799',
        'sash.hoverBorder': '#28bea6',
        'statusBar.background': '#1f9481',
        'statusBar.foreground': '#e7e7e7',
        'statusBarItem.hoverBackground': '#28bea6',
        'statusBarItem.remoteBackground': '#1f9481',
        'statusBarItem.remoteForeground': '#e7e7e7',
        'titleBar.activeBackground': '#1f9481',
        'titleBar.activeForeground': '#e7e7e7',
        'titleBar.inactiveBackground': '#1f948199',
        'titleBar.inactiveForeground': '#e7e7e799'
    }],
    ['Green',{
        'activityBar.activeBackground': '#1fab5b',
        'activityBar.background': '#1fab5b',
        'activityBar.foreground': '#e7e7e7',
        'activityBar.inactiveForeground': '#e7e7e799',
        'activityBarBadge.background': '#7327d8',
        'activityBarBadge.foreground': '#e7e7e7',
        'commandCenter.border': '#e7e7e799',
        'sash.hoverBorder': '#1fab5b',
        'statusBar.background': '#178044',
        'statusBar.foreground': '#e7e7e7',
        'statusBarItem.hoverBackground': '#1fab5b',
        'statusBarItem.remoteBackground': '#178044',
        'statusBarItem.remoteForeground': '#e7e7e7',
        'titleBar.activeBackground': '#178044',
        'titleBar.activeForeground': '#e7e7e7',
        'titleBar.inactiveBackground': '#17804499',
        'titleBar.inactiveForeground': '#e7e7e799'
    } ],
    ['Kiwi', {
        'activityBar.activeBackground': '#8cd959',
        'activityBar.background': '#8cd959',
        'activityBar.foreground': '#15202b',
        'activityBar.inactiveForeground': '#15202b99',
        'activityBarBadge.background': '#4981d5',
        'activityBarBadge.foreground': '#e7e7e7',
        'commandCenter.border': '#15202b99',
        'sash.hoverBorder': '#8cd959',
        'statusBar.background': '#6fcf30',
        'statusBar.foreground': '#15202b',
        'statusBarItem.hoverBackground': '#59a626',
        'statusBarItem.remoteBackground': '#6fcf30',
        'statusBarItem.remoteForeground': '#15202b',
        'titleBar.activeBackground': '#6fcf30',
        'titleBar.activeForeground': '#15202b',
        'titleBar.inactiveBackground': '#6fcf3099',
        'titleBar.inactiveForeground': '#15202b99'
    }],
    ['Brown', {
        'activityBar.activeBackground': '#ac6346',
        'activityBar.background': '#ac6346',
        'activityBar.foreground': '#e7e7e7',
        'activityBar.inactiveForeground': '#e7e7e799',
        'activityBarBadge.background': '#77c88e',
        'activityBarBadge.foreground': '#15202b',
        'commandCenter.border': '#e7e7e799',
        'sash.hoverBorder': '#ac6346',
        'statusBar.background': '#884e37',
        'statusBar.foreground': '#e7e7e7',
        'statusBarItem.hoverBackground': '#ac6346',
        'statusBarItem.remoteBackground': '#884e37',
        'statusBarItem.remoteForeground': '#e7e7e7',
        'titleBar.activeBackground': '#884e37',
        'titleBar.activeForeground': '#e7e7e7',
        'titleBar.inactiveBackground': '#884e3799',
        'titleBar.inactiveForeground': '#e7e7e799'
    }],
    ['Light Yellow', {
        'activityBar.activeBackground': '#f3fdcf',
        'activityBar.background': '#f3fdcf',
        'activityBar.foreground': '#15202b',
        'activityBar.inactiveForeground': '#15202b99',
        'activityBarBadge.background': '#09aad6',
        'activityBarBadge.foreground': '#e7e7e7',
        'commandCenter.border': '#15202b99',
        'sash.hoverBorder': '#f3fdcf',
        'statusBar.background': '#e6fa9f',
        'statusBar.foreground': '#15202b',
        'statusBarItem.hoverBackground': '#d9f76f',
        'statusBarItem.remoteBackground': '#e6fa9f',
        'statusBarItem.remoteForeground': '#15202b',
        'titleBar.activeBackground': '#e6fa9f',
        'titleBar.activeForeground': '#15202b',
        'titleBar.inactiveBackground': '#e6fa9f99',
        'titleBar.inactiveForeground': '#15202b99'
    }],
    ['Pink', {
        'activityBar.activeBackground': '#e774c0',
        'activityBar.background': '#e774c0',
        'activityBar.foreground': '#15202b',
        'activityBar.inactiveForeground': '#15202b99',
        'activityBarBadge.background': '#ceec92',
        'activityBarBadge.foreground': '#15202b',
        'commandCenter.border': '#15202b99',
        'sash.hoverBorder': '#e774c0',
        'statusBar.background': '#df49ac',
        'statusBar.foreground': '#15202b',
        'statusBarItem.hoverBackground': '#d02596',
        'statusBarItem.remoteBackground': '#df49ac',
        'statusBarItem.remoteForeground': '#15202b',
        'titleBar.activeBackground': '#df49ac',
        'titleBar.activeForeground': '#15202b',
        'titleBar.inactiveBackground': '#df49ac99',
        'titleBar.inactiveForeground': '#15202b99'
    }],
    ['Violet', {
        'activityBar.activeBackground': '#b07eb5',
        'activityBar.background': '#b07eb5',
        'activityBar.foreground': '#15202b',
        'activityBar.inactiveForeground': '#15202b99',
        'activityBarBadge.background': '#d1cdae',
        'activityBarBadge.foreground': '#15202b',
        'commandCenter.border': '#e7e7e799',
        'sash.hoverBorder': '#b07eb5',
        'statusBar.background': '#9c5da3',
        'statusBar.foreground': '#e7e7e7',
        'statusBarItem.hoverBackground': '#b07eb5',
        'statusBarItem.remoteBackground': '#9c5da3',
        'statusBarItem.remoteForeground': '#e7e7e7',
        'titleBar.activeBackground': '#9c5da3',
        'titleBar.activeForeground': '#e7e7e7',
        'titleBar.inactiveBackground': '#9c5da399',
        'titleBar.inactiveForeground': '#e7e7e799'
    }]
])
function changeWorkspaceColor(){
    // check if it is a valid workspace
    if(vscode.workspace.workspaceFolders){
        let colorsList  = ['Red','Green', 'Blue'];
        vscode.window.showQuickPick(Array.from(colorsMap.keys()))
            .then(result =>{
                const newColors = colorsMap.get(result);
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

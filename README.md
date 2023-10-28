# Salesforce Dev Tools
 Some useful handy tool for salesforce developers

## Prerequisites
Before you set up Salesforce Dev Tools for VS Code, make sure that you have these essentials.
- Salesforce CLI
- Visual Studio Code v1.0.0 or later

## Features
Salesforce doesn't provide right click menu to show deploy/retrieve for scratch org created from git. This plugin can help you do this. 

1. Open any file, and do your chanes and open command palette (press Ctrl+Shift+P on Windows or Linux, or Cmd+Shift+P on macOS) select **DT: Deploy current file** for *Deploy* and **DT: Retrieve current file** for *Retrive* from org. 
2. Key bindings:
    *Deploy current file*: press **Ctrl+Shift+D** on Windows or Linux, or Cmd+Shift+D on macOS
    *Retrieve current file*: press **Ctrl+Shift+R** on Windows or Linux, or Cmd+Shift+R on macOS
3. Open any file and right click on editor/ sidebar explorer, it will display option to retrieve/ deploy current file.
![Example Deploy](https://github.com/Nagarjuna-chinthala/Salesforce-Dev-Tools/blob/main/images/Deploy-retrieve-cmds.gif)
4. Org workspace color: We can be confuled, if we have multiple orgs connected in vs code workspace. we can add different colors for diffrent org workspaces to easy identify the which org it is.
![Example org color](https://github.com/Nagarjuna-chinthala/Salesforce-Dev-Tools/blob/main/images/OrgWorkspaceColor.gif)
5. slds and js snippets are added. 
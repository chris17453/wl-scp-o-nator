const vscode = require('vscode');
const scp = require('scp2');
const path = require('path');

function activate(context) {
    let upload = vscode.commands.registerCommand('extension.upload', function () {
        const options = {
            prompt: "Enter server path",
            placeHolder: "/remote/path"
        };
        vscode.window.showInputBox(options).then(serverPath => {
            if (serverPath) {
                const localPath = vscode.workspace.rootPath;
                scp.scp(localPath, serverPath, err => {
                    if (err) {
                        vscode.window.showErrorMessage(err.message);
                    } else {
                        vscode.window.showInformationMessage('Upload successful');
                    }
                });
            }
        });
    });

    let download = vscode.commands.registerCommand('extension.download', function () {
        const options = {
            prompt: "Enter server path",
            placeHolder: "/remote/path"
        };
        vscode.window.showInputBox(options).then(serverPath => {
            if (serverPath) {
                const localPath = vscode.workspace.rootPath;
                scp.scp(serverPath, localPath, err => {
                    if (err) {
                        vscode.window.showErrorMessage(err.message);
                    } else {
                        vscode.window.showInformationMessage('Download successful');
                    }
                });
            }
        });
    });

    let sync = vscode.commands.registerCommand('extension.sync', function () {
        const options = {
            prompt: "Enter server path",
            placeHolder: "/remote/path"
        };
        vscode.window.showInputBox(options).then(serverPath => {
            if (serverPath) {
                const localPath = vscode.workspace.rootPath;
                scp.scp(localPath, serverPath, err => {
                    if (err) {
                        vscode.window.showErrorMessage('Upload failed: ' + err.message);
                    } else {
                        scp.scp(serverPath, localPath, err => {
                            if (err) {
                                vscode.window.showErrorMessage('Download failed: ' + err.message);
                            } else {
                                vscode.window.showInformationMessage('Sync successful');
                            }
                        });
                    }
                });
            }
        });
    });

    context.subscriptions.push(upload);
    context.subscriptions.push(download);
    context.subscriptions.push(sync);
}

function deactivate() {}

module.exports = {
    activate,
    deactivate
};

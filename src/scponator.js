const vscode = require('vscode');
const { exec, spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const os = require('os');

let transferredFiles = [];
let errorFiles = [];
let sessionStartTime = new Date();
let sessionNumber = 0;
let statusBarItem;
let isTransferring = false;
let currentTransferCount = 0;
let totalTransferCount = 0;
const outputChannel = vscode.window.createOutputChannel('File Transfer Log');

function activate(context) {
    outputChannel.appendLine('Activating extension...');
    
    // Initialize status bar
    statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
    context.subscriptions.push(statusBarItem);

    // Configuration wizard command
    let configureCommand = vscode.commands.registerCommand('scponator.configure', function () {
        showConfigurationWizard();
    });

    // Test connection command
    let testConnectionCommand = vscode.commands.registerCommand('scponator.testConnection', function () {
        testSSHConnection();
    });

    // Retry failed transfers command
    let retryFailedCommand = vscode.commands.registerCommand('scponator.retryFailed', function () {
        retryFailedTransfers();
    });

    // Compare files command
    let compareFilesCommand = vscode.commands.registerCommand('scponator.compareFiles', function (uri) {
        compareLocalVsRemote(uri);
    });

    // Sync directory command
    let syncDirectoryCommand = vscode.commands.registerCommand('scponator.syncDirectory', function (uri) {
        syncDirectory(uri);
    });

    let uploadDirectoryCommand = vscode.commands.registerCommand('scponator.uploadDirectory', function (uri) {
        startNewSession();
        handleDirectoryTransfer('upload', uri, endSession);
    });

    let downloadDirectoryCommand = vscode.commands.registerCommand('scponator.downloadDirectory', function (uri) {
        startNewSession();
        handleDirectoryTransfer('download', uri, endSession);
    });

    let uploadSelectedCommand = vscode.commands.registerCommand('scponator.uploadSelected', function (uri, uris) {
        startNewSession();
        handleMultipleSelection('upload', uri, uris, endSession);
    });

    let downloadSelectedCommand = vscode.commands.registerCommand('scponator.downloadSelected', function (uri, uris) {
        startNewSession();
        handleMultipleSelection('download', uri, uris, endSession);
    });

    let uploadProjectCommand = vscode.commands.registerCommand('scponator.uploadProject', function () {
        vscode.window.showInformationMessage('Do you want to upload the entire project?', 'Yes', 'No').then(answer => {
            if (answer === 'Yes') {
                startNewSession();
                handleProjectTransfer('upload', endSession);
            }
        });
    });

    let downloadProjectCommand = vscode.commands.registerCommand('scponator.downloadProject', function () {
        vscode.window.showInformationMessage('Do you want to download the entire project?', 'Yes', 'No').then(answer => {
            if (answer === 'Yes') {
                startNewSession();
                handleProjectTransfer('download', endSession);
            }
        });
    });



    context.subscriptions.push(configureCommand);
    context.subscriptions.push(testConnectionCommand);
    context.subscriptions.push(retryFailedCommand);
    context.subscriptions.push(compareFilesCommand);
    context.subscriptions.push(syncDirectoryCommand);
    context.subscriptions.push(uploadDirectoryCommand);
    context.subscriptions.push(downloadDirectoryCommand);
    context.subscriptions.push(uploadSelectedCommand);
    context.subscriptions.push(downloadSelectedCommand);
    context.subscriptions.push(uploadProjectCommand);
    context.subscriptions.push(downloadProjectCommand);

    outputChannel.appendLine('Extension activated successfully.');
}

function startNewSession() {
    sessionStartTime = new Date();
    sessionNumber += 1;
    transferredFiles = [];
    errorFiles = [];
    currentTransferCount = 0;
    totalTransferCount = 0;
    outputChannel.clear();
    outputChannel.show(true);
    outputChannel.appendLine(`Transfer Session ${sessionNumber} started at: ${sessionStartTime.toLocaleString()}`);
    updateStatusBar();
}

function updateStatusBar(message = null) {
    if (message) {
        statusBarItem.text = `$(sync~spin) ${message}`;
        statusBarItem.show();
    } else if (isTransferring && totalTransferCount > 0) {
        statusBarItem.text = `$(sync~spin) SCP: ${currentTransferCount}/${totalTransferCount} files`;
        statusBarItem.show();
    } else if (errorFiles.length > 0) {
        statusBarItem.text = `$(error) SCP: ${errorFiles.length} failed`;
        statusBarItem.command = 'scponator.retryFailed';
        statusBarItem.show();
    } else {
        statusBarItem.hide();
    }
}

let pendingTransfers = 0;

function setupSSHEnvironment() {
    const env = { ...process.env };
    
    // Fix SSH passphrase issues on macOS by ensuring proper SSH_ASKPASS handling
    if (os.platform() === 'darwin') {
        // Use VS Code's built-in credential helper or system keychain
        env.SSH_ASKPASS_REQUIRE = 'never';
        env.DISPLAY = ':0'; // Fallback display
    }
    
    return env;
}

function executeCommandWithEnv(command, callback) {
    const env = setupSSHEnvironment();
    
    exec(command, { env }, callback);
}

function endSession() {
    isTransferring = false;
    outputChannel.appendLine(`Transfer Session ${sessionNumber} ended at: ${new Date().toLocaleString()}`);
    if (errorFiles.length > 0) {
        outputChannel.appendLine(`Files with errors:`);
        errorFiles.forEach(file => {
            outputChannel.appendLine(`- ${file.path}: ${file.error}`);
            outputChannel.appendLine(`Command used: ${file.command}`);
        });
    }
    updateStatusBar();
}

async function showConfigurationWizard() {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders || workspaceFolders.length === 0) {
        vscode.window.showErrorMessage('Please open a workspace folder first!');
        return;
    }

    const configPath = path.join(workspaceFolders[0].uri.fsPath, '.scpconfig.json');
    
    // Check if config already exists
    if (fs.existsSync(configPath)) {
        const answer = await vscode.window.showInformationMessage(
            'Configuration file already exists. Do you want to recreate it?',
            'Yes', 'No'
        );
        if (answer !== 'Yes') return;
    }

    try {
        // Get configuration details from user
        const host = await vscode.window.showInputBox({
            prompt: 'Enter the hostname or IP address of your remote server',
            placeHolder: 'example.com or 192.168.1.100'
        });
        if (!host) return;

        const username = await vscode.window.showInputBox({
            prompt: 'Enter your SSH username',
            placeHolder: 'root'
        });
        if (!username) return;

        const port = await vscode.window.showInputBox({
            prompt: 'Enter SSH port (default: 22)',
            placeHolder: '22',
            value: '22'
        });

        const remoteDirectory = await vscode.window.showInputBox({
            prompt: 'Enter the remote directory path',
            placeHolder: '/var/www/html/'
        });
        if (!remoteDirectory) return;

        const privateKeyPath = await vscode.window.showInputBox({
            prompt: 'Enter path to your SSH private key (optional)',
            placeHolder: '~/.ssh/id_rsa or C:\\Users\\user\\.ssh\\id_rsa'
        });

        const isWindows = os.platform() === 'win32';
        let usePuttyTools = false;
        let puttyPath = '';

        if (isWindows) {
            const puttyAnswer = await vscode.window.showInformationMessage(
                'Are you using PuTTY tools (recommended for Windows)?',
                'Yes', 'No'
            );
            usePuttyTools = puttyAnswer === 'Yes';

            if (usePuttyTools) {
                puttyPath = await vscode.window.showInputBox({
                    prompt: 'Enter path to PuTTY tools directory',
                    placeHolder: 'C:\\Program Files\\PuTTY'
                });
            }
        }

        const forceScpAnswer = await vscode.window.showInformationMessage(
            'Force SCP protocol? (Enable for older devices like OpenWrt)',
            'Yes', 'No'
        );
        const forceScpProtocol = forceScpAnswer === 'Yes';

        const forcePreserveAttributesAnswer = await vscode.window.showInformationMessage(
            'Preserve Attributes on uploaded/downloaded files? (Enable to preserve time / permissions)',
            'Yes', 'No'
        );
        const preserveAttributes = forcePreserveAttributesAnswer === 'No';

        // Create configuration object
        const config = {
            host,
            username,
            port: parseInt(port) || 22,
            remoteDirectory,
            usePuttyTools,
            puttyPath,
            privateKey: privateKeyPath || '',
            forceScpProtocol,
            preserveAttributes,
            ignore: [
                'node_modules',
                '.git',
                '*.log',
                '.DS_Store'
            ]
        };

        // Write configuration file
        fs.writeFileSync(configPath, JSON.stringify(config, null, 4));
        
        vscode.window.showInformationMessage(
            `Configuration saved to ${configPath}. Would you like to test the connection?`,
            'Test Now', 'Later'
        ).then(answer => {
            if (answer === 'Test Now') {
                testSSHConnection();
            }
        });

    } catch (error) {
        vscode.window.showErrorMessage(`Configuration wizard failed: ${error.message}`);
    }
}

async function testSSHConnection() {
    updateStatusBar('Testing SSH connection...');
    
    try {
        const config = getConfig(null);
        const testCommand = buildMkdirCommand(config, '/tmp');
        
        executeCommandWithEnv(testCommand, (err, stdout, stderr) => {
            if (err) {
                vscode.window.showErrorMessage(`SSH connection failed: ${stderr}`);
                outputChannel.appendLine(`Connection test failed: ${stderr}`);
                outputChannel.appendLine(`Command used: ${testCommand}`);
            } else {
                vscode.window.showInformationMessage('SSH connection successful!');
                outputChannel.appendLine('SSH connection test passed');
            }
            updateStatusBar();
        });
        
    } catch (error) {
        vscode.window.showErrorMessage(`Configuration error: ${error.message}`);
        updateStatusBar();
    }
}

function retryFailedTransfers() {
    if (errorFiles.length === 0) {
        vscode.window.showInformationMessage('No failed transfers to retry');
        return;
    }

    const failedFiles = [...errorFiles];
    errorFiles = [];
    
    startNewSession();
    outputChannel.appendLine(`Retrying ${failedFiles.length} failed transfers...`);
    
    isTransferring = true;
    totalTransferCount = failedFiles.length;
    currentTransferCount = 0;
    updateStatusBar();

    let completedCount = 0;
    const onRetryComplete = () => {
        completedCount++;
        currentTransferCount = completedCount;
        updateStatusBar();
        
        if (completedCount >= failedFiles.length) {
            isTransferring = false;
            endSession();
        }
    };

    failedFiles.forEach((failedFile, index) => {
        outputChannel.appendLine(`[${index + 1}/${failedFiles.length}] Retrying: ${failedFile.path}`);
        
        // Re-execute the original command
        executeCommandWithEnv(failedFile.command, (err, stdout, stderr) => {
            if (err) {
                outputChannel.appendLine(`Retry failed for ${failedFile.path}: ${stderr}`);
                errorFiles.push(failedFile);
            } else {
                outputChannel.appendLine(`Retry successful: ${failedFile.path}`);
                transferredFiles.push({ 
                    direction: 'Retried', 
                    path: failedFile.path, 
                    size: 'Unknown', 
                    timestamp: new Date() 
                });
            }
            onRetryComplete();
        });
    });
}

async function compareLocalVsRemote(uri) {
    if (!uri) {
        vscode.window.showErrorMessage('No file selected for comparison');
        return;
    }

    try {
        const config = getConfig(uri);
        const localPath = uri.fsPath;
        const remotePath = getRemotePath(config, uri);
        
        updateStatusBar('Comparing files...');
        
        // Get local file stats
        const localStats = fs.statSync(localPath);
        const localSize = localStats.size;
        const localMtime = localStats.mtime;
        
        // Get remote file stats using SSH
        const statCommand = config.usePuttyTools 
            ? `"${config.puttyPath}\\plink.exe" -i "${config.privateKey}" ${config.username}@${config.host} "stat -c '%s %Y' ${remotePath}"`
            : `ssh -i "${config.privateKey}" ${config.username}@${config.host} "stat -c '%s %Y' ${remotePath}"`;
        
        executeCommandWithEnv(statCommand, (err, stdout, stderr) => {
            updateStatusBar();
            
            if (err) {
                vscode.window.showWarningMessage(`Remote file not found or inaccessible: ${remotePath}`);
                return;
            }
            
            const [remoteSize, remoteMtimeUnix] = stdout.trim().split(' ');
            const remoteMtime = new Date(parseInt(remoteMtimeUnix) * 1000);
            
            const comparison = {
                localSize: parseInt(localSize),
                remoteSize: parseInt(remoteSize),
                localMtime: localMtime.toISOString(),
                remoteMtime: remoteMtime.toISOString(),
                sizeDiff: parseInt(localSize) - parseInt(remoteSize),
                timeDiff: localMtime.getTime() - remoteMtime.getTime()
            };
            
            let message = `File Comparison: ${path.basename(localPath)}\n\n`;
            message += `Local:  ${comparison.localSize} bytes, modified ${comparison.localMtime}\n`;
            message += `Remote: ${comparison.remoteSize} bytes, modified ${comparison.remoteMtime}\n\n`;
            
            if (comparison.sizeDiff === 0) {
                message += '✅ Sizes match';
            } else {
                message += `❌ Size difference: ${comparison.sizeDiff} bytes`;
            }
            
            if (Math.abs(comparison.timeDiff) < 1000) {
                message += '\n✅ Modification times match';
            } else if (comparison.timeDiff > 0) {
                message += '\n📤 Local file is newer';
            } else {
                message += '\n📥 Remote file is newer';
            }
            
            vscode.window.showInformationMessage(message);
            outputChannel.appendLine(message);
        });
        
    } catch (error) {
        updateStatusBar();
        vscode.window.showErrorMessage(`Comparison failed: ${error.message}`);
    }
}

async function syncDirectory(uri) {
    if (!uri || !fs.lstatSync(uri.fsPath).isDirectory()) {
        vscode.window.showErrorMessage('Please select a directory to sync');
        return;
    }

    const answer = await vscode.window.showInformationMessage(
        'Sync directory with remote? This will upload newer local files and download newer remote files.',
        'Sync Now', 'Cancel'
    );
    
    if (answer !== 'Sync Now') return;

    try {
        const config = getConfig(uri);
        const localPath = uri.fsPath;
        const remotePath = getRemotePath(config, uri);
        
        startNewSession();
        updateStatusBar('Synchronizing directory...');
        
        outputChannel.appendLine(`Starting bidirectional sync: ${localPath} <-> ${remotePath}`);
        
        // For now, implement simple upload (can be enhanced later)
        handleDirectoryTransfer('upload', uri, () => {
            updateStatusBar();
            vscode.window.showInformationMessage('Directory sync completed (upload only for now)');
        });
        
    } catch (error) {
        updateStatusBar();
        vscode.window.showErrorMessage(`Sync failed: ${error.message}`);
    }
}

function handleSingleFileTransfer(action, uri, callback) {
    outputChannel.appendLine(`Handling single file transfer for action: ${action}`);
 
    try {
        const config = getConfig(uri);
        const localPath = uri.fsPath;
        const remotePath = getRemotePath(config, uri);
        const userHost = `${config.username}@${config.host}`;

        if (action === 'upload') {
            uploadFile(config, localPath, remotePath, userHost);
            callback();
        } else if (action === 'download') {
            downloadFile(config, localPath, remotePath, userHost, callback);
        } 
    } catch (error) {
        vscode.window.showErrorMessage(`Configuration error: ${error.message}`);
        outputChannel.appendLine(`Configuration error: ${error.message}`);
        callback();
    }
}

function handleDirectoryTransfer(action, uri, callback) {
    outputChannel.appendLine(`Handling directory transfer for action: ${action}`);
    if (!uri) {
        vscode.window.showErrorMessage('No directory selected!');
        callback();
        return;
    }

    if (!fs.lstatSync(uri.fsPath).isDirectory()) {
        vscode.window.showErrorMessage('Selected item is not a directory!');
        callback();
        return;
    }
 
    try {
        const config = getConfig(uri);
        const localPath = uri.fsPath;
        const remotePath = getRemotePath(config, uri);
        const userHost = `${config.username}@${config.host}`;

        if (action === 'upload') {
            uploadDirectory(config, localPath, remotePath, userHost, callback);
        } else if (action === 'download') {
            downloadDirectory(config, localPath, remotePath, userHost, callback);
        } 
    } catch (error) {
        vscode.window.showErrorMessage(`Configuration error: ${error.message}`);
        outputChannel.appendLine(`Configuration error: ${error.message}`);
        callback();
    }
}

function handleMultipleSelection(action, uri, uris, callback) {
    outputChannel.appendLine(`Handling multiple selection transfer for action: ${action}`);
    
    // If no multiple selection (uris is undefined), fall back to single selection
    if (!uris || uris.length === 0) {
        if (uri) {
            // Handle single selection
            const isDirectory = fs.lstatSync(uri.fsPath).isDirectory();
            if (isDirectory) {
                handleDirectoryTransfer(action, uri, callback);
            } else {
                handleSingleFileTransfer(action, uri, callback);
            }
        } else {
            // Handle keybinding case - get active file
            uri = getActiveFileUri();
            if (uri) {
                if (action == 'upload') {
                    vscode.workspace.saveAll(false); 
                }
                handleSingleFileTransfer(action, uri, callback);
            } else {
                vscode.window.showErrorMessage('No items selected!');
                callback();
            }
        }
        return;
    }

    // Handle multiple selections with progress tracking
    isTransferring = true;
    totalTransferCount = uris.length;
    currentTransferCount = 0;
    updateStatusBar();
    
    outputChannel.appendLine(`Processing ${uris.length} selected items...`);
    
    try {
        const config = getConfig(uris[0]);
        const userHost = `${config.username}@${config.host}`;
        
        let completedCount = 0;
        let totalCount = uris.length;
        
        const onItemComplete = () => {
            completedCount++;
            currentTransferCount = completedCount;
            updateStatusBar();
            
            if (completedCount >= totalCount) {
                isTransferring = false;
                callback();
            }
        };

        // Process each selected item
        uris.forEach((selectedUri, index) => {
            const localPath = selectedUri.fsPath;
            const remotePath = getRemotePath(config, selectedUri);
            const isDirectory = fs.lstatSync(localPath).isDirectory();
            
            outputChannel.appendLine(`[${index + 1}/${totalCount}] Processing: ${localPath}`);
            
            if (isDirectory) {
                if (action === 'upload') {
                    uploadDirectory(config, localPath, remotePath, userHost, onItemComplete);
                } else if (action === 'download') {
                    downloadDirectory(config, localPath, remotePath, userHost, onItemComplete);
                }
            } else {
                if (action === 'upload') {
                    uploadFile(config, localPath, remotePath, userHost);
                    onItemComplete();
                } else if (action === 'download') {
                    downloadFile(config, localPath, remotePath, userHost, onItemComplete);
                }
            }
        });
        
    } catch (error) {
        isTransferring = false;
        vscode.window.showErrorMessage(`Configuration error: ${error.message}`);
        outputChannel.appendLine(`Configuration error: ${error.message}`);
        callback();
    }
}

async function handleProjectTransfer(action) {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders || workspaceFolders.length === 0) {
        vscode.window.showErrorMessage('No workspace is open!');
        return;
    }

    const workspaceRoot = workspaceFolders[0].uri.fsPath;
    try {
        const config = getConfig(null);  // Pass null to get config from workspace root
        const remotePath = config.remoteDirectory;
        const userHost = `${config.username}@${config.host}`;
        const ignorePatterns = config.ignore || [];

        outputChannel.appendLine(`Starting project ${action}...`);

        await traverseDirectory(workspaceRoot, async (localPath) => {
            const relativePath = path.relative(workspaceRoot, localPath);
            const remoteFilePath = path.join(remotePath, relativePath).replace(/\\/g, '/');

            if (action === 'upload') {
                await uploadFile(config, localPath, remoteFilePath, userHost);
            } else if (action === 'download') {
                await downloadFile(config, localPath, remoteFilePath, userHost);
            }
        }, ignorePatterns);

        endSession();
    } catch (error) {
        vscode.window.showErrorMessage(`Configuration error: ${error.message}`);
        outputChannel.appendLine(`Configuration error: ${error.message}`);
    }
}

async function traverseDirectory(dir, callback, ignorePatterns) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        // Skip '.' and '..'
        if (file === '.' || file === '..') {
            continue;
        }

        const fullPath = path.join(dir, file);
        const relativePath = path.relative(dir, fullPath);

        if (shouldIgnore(relativePath, ignorePatterns)) {
            continue;
        }

        if (fs.lstatSync(fullPath).isDirectory()) {
            await traverseDirectory(fullPath, callback, ignorePatterns);
        } else {
            await callback(fullPath);
        }
    }
}

function shouldIgnore(filePath, patterns) {
    return patterns.some(pattern => {
        const regex = new RegExp(pattern.replace('*', '.*').replace('?', '.'));
        return regex.test(filePath);
    });
}

function getConfig(uri) {
    let configPath = uri ? path.join(path.dirname(uri.fsPath), '.scpconfig.json') : '';

    if (!fs.existsSync(configPath)) {
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (workspaceFolders) {
            configPath = path.join(workspaceFolders[0].uri.fsPath, '.scpconfig.json');
        }

        if (!fs.existsSync(configPath)) {
            throw new Error('Configuration file .scpconfig.json not found in the selected directory or workspace root!');
        }
    }

    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    const requiredFields = ['username', 'host', 'remoteDirectory'];
    for (const field of requiredFields) {
        if (!config[field]) {
            throw new Error(`Configuration file .scpconfig.json is missing the required field: ${field}`);
        }
    }

    return config;
}

function getRemotePath(config, uri) {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders) {
        throw new Error('No workspace is open!');
    }

    const workspaceRoot = workspaceFolders[0].uri.fsPath;
    const relativePath = path.relative(workspaceRoot, uri.fsPath);
    return path.join(config.remoteDirectory, relativePath).replace(/\\/g, '/');
}

function createRemoteDirectory(config, remoteDir, callback, retryCount = 3, delay = 2000) {
    const mkdirCommand = buildMkdirCommand(config, remoteDir);

    const executeMkdirCommand = (retriesLeft) => {
        executeCommandWithEnv(mkdirCommand, (err, stdout, stderr) => {
            if (err) {
                if (retriesLeft > 0) {
                    setTimeout(() => executeMkdirCommand(retriesLeft - 1), delay);
                } else {
                    outputChannel.appendLine(`Final error creating remote directory ${remoteDir}: ${stderr}`);
                    outputChannel.appendLine(`Command used: ${mkdirCommand}`);
                    errorFiles.push({ path: remoteDir, error: stderr, command: mkdirCommand });
                    if (callback) callback(err);
                }
            } else {
                callback(null);
            }
        });
    };

    executeMkdirCommand(retryCount);
}
function buildScpCommand(config, source, userHost, destination, action) {
    let authOptions = '';
    let portOption = '';
    
    // Add port configuration if specified
    if (config.port && config.port !== 22) {
        portOption = config.usePuttyTools ? `-P ${config.port}` : `-P ${config.port}`;
    }

    // Determine if using PuTTY tools (Windows) or OpenSSH tools (Linux/macOS)
    if (config.usePuttyTools) {
        // For PuTTY tools, use the .ppk private key and specify the puttyPath
        if (config.privateKey) {
            authOptions = `-i "${config.privateKey}"`;
        }
        
        // Add -scp flag for pscp compatibility with older OpenWrt devices
        let scpFlag = config.forceScpProtocol ? '-scp' : '';
        let pscpOptions = config.preserveAttributes ? '-p' : '';

        // PSCP command format for upload/download
        if (action === 'upload') {
            return `"${config.puttyPath}\\pscp.exe" ${authOptions} ${portOption} ${scpFlag} ${pscpOptions} "${source}" ${userHost}:${destination}`;
        } else if (action === 'download') {
            return `"${config.puttyPath}\\pscp.exe" ${authOptions} ${portOption} ${scpFlag} ${pscpOptions} ${userHost}:${source} "${destination}"`;
        }
    } else {
        // For OpenSSH tools, use the standard private key usage
        if (config.privateKey) {
            authOptions = `-i "${config.privateKey}"`;
        }
        
        // Add additional SSH options to handle passphrase prompts properly on macOS
        let sshOptions = '-o BatchMode=no -o StrictHostKeyChecking=no';
        let scpOptions = config.preserveAttributes ? '-p' : '';
        
        // SCP command format for upload/download
        if (action === 'upload') {
            return `scp ${authOptions} ${portOption} ${sshOptions} ${scpOptions} -r "${source}" ${userHost}:${destination}`;
        } else if (action === 'download') {
            return `scp ${authOptions} ${portOption} ${sshOptions} ${scpOptions} -r ${userHost}:${source} "${destination}"`;
        }
    }
}


function buildMkdirCommand(config, remoteDir) {
    let authOptions = '';
    let portOption = '';
    
    // Add port configuration if specified
    if (config.port && config.port !== 22) {
        portOption = config.usePuttyTools ? `-P ${config.port}` : `-p ${config.port}`;
    }

    // Determine if using PuTTY tools (Windows) or OpenSSH tools (Linux/macOS)
    if (config.usePuttyTools) {
        // For PuTTY tools, use the .ppk private key and specify the puttyPath
        if (config.privateKey) {
            authOptions = `-i "${config.privateKey}"`;
        }
        // Plink command for directory creation
        return `"${config.puttyPath}\\plink.exe" ${authOptions} ${portOption} ${config.username}@${config.host} "mkdir -p ${remoteDir}"`;
    } else {
        // For OpenSSH tools, standard private key usage
        if (config.privateKey) {
            authOptions = `-i "${config.privateKey}"`;
        }
        
        // Add SSH options to handle passphrase prompts properly on macOS
        let sshOptions = '-o BatchMode=no -o StrictHostKeyChecking=no';
        
        // SSH command for directory creation
        return `ssh ${authOptions} ${portOption} ${sshOptions} ${config.username}@${config.host} "mkdir -p ${remoteDir}"`;
    }
}


async function uploadFile(config, localPath, remotePath, userHost, retryCount = 3, delay = 2000) {
    const baseDir = config.remoteDirectory;
    const remoteDir = path.dirname(remotePath);

    if (remoteDir !== baseDir) {
        createRemoteDirectory(config, remoteDir, (mkdirError) => {
            if (mkdirError) {
                outputChannel.appendLine(`Error during directory creation, aborting upload for ${localPath}`);
            } else {
                uploadFileWithRetry(config, localPath, remotePath, userHost, retryCount, delay);
            }
        }, retryCount, delay);
    } else {
        uploadFileWithRetry(config, localPath, remotePath, userHost, retryCount, delay);
    }
}

function uploadFileWithRetry(config, localPath, remotePath, userHost, retryCount = 3, delay = 2000) {
    const scpCommand = buildScpCommand(config, localPath, userHost, remotePath, 'upload');

    const executeScpCommand = (retriesLeft) => {
        executeCommandWithEnv(scpCommand, (err, stdout, stderr) => {
            if (err) {
                if (retriesLeft > 0) {
                    setTimeout(() => executeScpCommand(retriesLeft - 1), delay);
                } else {
                    outputChannel.appendLine(`Final upload error for file ${localPath}: ${stderr}`);
                    outputChannel.appendLine(`Command used: ${scpCommand}`);
                    outputChannel.appendLine(`Source: ${localPath}`);
                    outputChannel.appendLine(`Destination: ${remotePath}`);
                    vscode.window.showErrorMessage(`Error uploading file ${localPath}: ${stderr}`);
                    errorFiles.push({ path: localPath, error: stderr, command: scpCommand });
                }
            } else {
                const fileSize = fs.statSync(localPath).size;
                transferredFiles.push({ direction: 'Sent', path: localPath, size: fileSize, timestamp: new Date() });
                outputChannel.appendLine(`${localPath} --> ${remotePath}`);
            }
        });
    };

    executeScpCommand(retryCount);
}

function uploadDirectory(config, localPath, remotePath, userHost, callback = null, retryCount = 3, delay = 2000) {
    const scpCommand = buildScpCommand(config, localPath, userHost, remotePath, 'upload');

    const executeScpCommand = (retriesLeft) => {
        executeCommandWithEnv(scpCommand, (err, stdout, stderr) => {
            if (err) {
                if (retriesLeft > 0) {
                    setTimeout(() => executeScpCommand(retriesLeft - 1), delay);
                } else {
                    outputChannel.appendLine(`Final upload error for directory ${localPath}: ${stderr}`);
                    outputChannel.appendLine(`Command used: ${scpCommand}`);
                    outputChannel.appendLine(`Source: ${localPath}`);
                    outputChannel.appendLine(`Destination: ${remotePath}`);
                    vscode.window.showErrorMessage(`Error uploading directory ${localPath}: ${stderr}`);
                    errorFiles.push({ path: localPath, error: stderr, command: scpCommand });
                    if (callback) callback();
                }
            } else {
                transferredFiles.push({ direction: 'Sent', path: localPath, size: 'Directory', timestamp: new Date() });
                outputChannel.appendLine(`${localPath} --> ${remotePath} (Directory)`);
                if (callback) callback();
            }
        });
    };

    executeScpCommand(retryCount);
}

function downloadDirectory(config, localPath, remotePath, userHost, callback = null, retryCount = 3) {
    const scpCommand = buildScpCommand(config, remotePath, userHost, localPath, 'download');

    const executeCommand = (retriesLeft) => {
        executeCommandWithEnv(scpCommand, (err, stdout, stderr) => {
            if (err) {
                outputChannel.appendLine(`Download error for directory ${remotePath}: ${stderr}`);
                outputChannel.appendLine(`Command used: ${scpCommand}`);
                outputChannel.appendLine(`Source: ${remotePath}`);
                outputChannel.appendLine(`Destination: ${localPath}`);
                if (retriesLeft > 0) {
                    executeCommand(retriesLeft - 1);
                } else {
                    vscode.window.showErrorMessage(`Error downloading directory ${remotePath}: ${stderr}`);
                    errorFiles.push({ path: remotePath, error: stderr, command: scpCommand });
                    if (callback) callback();
                    return;
                }
            } else {
                transferredFiles.push({ direction: 'Received', path: localPath, size: 'Directory', timestamp: new Date() });
                outputChannel.appendLine(`${localPath} <--  ${remotePath} (Directory)`);
                if (callback) callback();
            }
        });
    };

    executeCommand(retryCount);
}

function downloadFile(config, localPath, remotePath, userHost, callback = null, retryCount = 3) {
    const scpCommand = buildScpCommand(config, remotePath, userHost, localPath, 'download');

    const executeCommand = (retriesLeft) => {
        executeCommandWithEnv(scpCommand, (err, stdout, stderr) => {
            if (err) {
                outputChannel.appendLine(`Download error for file ${remotePath}: ${stderr}`);
                outputChannel.appendLine(`Command used: ${scpCommand}`);
                outputChannel.appendLine(`Source: ${remotePath}`);
                outputChannel.appendLine(`Destination: ${localPath}`);
                if (retriesLeft > 0) {
                    executeCommand(retriesLeft - 1);
                } else {
                    vscode.window.showErrorMessage(`Error downloading file ${remotePath}: ${stderr}`);
                    errorFiles.push({ path: remotePath, error: stderr, command: scpCommand });
                    if (callback) callback();
                    return;
                }
            } else {
                const fileSize = fs.existsSync(localPath) ? fs.statSync(localPath).size : 0;
                transferredFiles.push({ direction: 'Received', path: localPath, size: fileSize, timestamp: new Date() });
                outputChannel.appendLine(`${localPath} <--  ${remotePath}`);
                if (callback) callback();
            }
        });
    };

    executeCommand(retryCount);
}

function getActiveFileUri() {
    const editor = vscode.window.activeTextEditor;
    if (editor) {
        return editor.document.uri;
    }
    vscode.window.showInformationMessage('No file is currently open!');
    return null;
}

exports.activate = activate;

function deactivate() { }

module.exports = {
    activate,
    deactivate
};
# Watkins Labs VSCode Uploader

## Overview

Watkins Labs VSCode Uploader is a Visual Studio Code extension that allows you to upload, download, and sync files and directories between your local workspace and a remote server using SCP (Secure Copy Protocol).

## Features

- **Upload Files/Directories**: Upload your local files or directories to a remote server.
- **Download Files/Directories**: Download files or directories from a remote server to your local workspace.
- **Sync Files/Directories**: Sync your local files or directories with a remote server, performing both upload and download operations.

## Requirements

- **VS Code**: Version 1.60.0 or higher
- **Node.js**: Ensure Node.js is installed on your system.

## Installation

1. Install the extension directly from the VSIX file:
   - Open VS Code.
   - Go to Extensions.
   - Click on the three dots in the upper right corner.
   - Select "Install from VSIX..." and choose the generated `.vsix` file.

## Usage

### Commands

The extension provides the following commands:

1. **Upload Files/Directories**:
   - Command: `Upload Files`
   - Description: Upload your local workspace files or directories to a remote server.
   - How to use: Press `Ctrl+Shift+P` (Windows/Linux) or `Cmd+Shift+P` (macOS) to open the Command Palette, then type `Upload Files` and press Enter. You will be prompted to enter the remote server path.

2. **Download Files/Directories**:
   - Command: `Download Files`
   - Description: Download files or directories from a remote server to your local workspace.
   - How to use: Press `Ctrl+Shift+P` (Windows/Linux) or `Cmd+Shift+P` (macOS) to open the Command Palette, then type `Download Files` and press Enter. You will be prompted to enter the remote server path.

3. **Sync Files/Directories**:
   - Command: `Sync Files`
   - Description: Sync your local workspace files or directories with a remote server, performing both upload and download operations.
   - How to use: Press `Ctrl+Shift+P` (Windows/Linux) or `Cmd+Shift+P` (macOS) to open the Command Palette, then type `Sync Files` and press Enter. You will be prompted to enter the remote server path.

### Configuration

Ensure you have SCP configured on your remote server. The extension will prompt you to enter the server path each time you run a command.

## Contributing

Contributions are welcome! If you encounter any issues or have feature requests, please open an issue or submit a pull request on the [GitHub repository](https://github.com/chris17453/wl-scp-o-nator).

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

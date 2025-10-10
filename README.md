# Watkins Labs SCP-O-NATOR

**WL-SCP-O-NATOR** is a Visual Studio Code extension that allows you to upload and download files between your local machine and a remote server using SCP. This extension simplifies the process of managing files on remote servers directly from your code editor.

![Demo of SCP-O-Nator in action](./assets/demo.gif)

## Perfect for Legacy Servers! 🚀

**Is your remote server too old for VS Code's built-in remote development?** This extension is the perfect solution!

- ✅ **Works with ANY SSH-enabled server** - even ancient Linux distributions
- ✅ **No server-side requirements** - just SSH access needed
- ✅ **OpenWrt compatibility** - perfect for router/embedded development
- ✅ **Legacy protocol support** - force SCP mode for older systems
- ✅ **Custom port support** - works with non-standard SSH configurations

**Stop struggling with outdated servers!** Keep your modern VS Code workflow while working with legacy systems, embedded devices, and older Linux distributions that can't run VS Code Server.

## Why?
We think its better to work from your local machine and push to the remote one - especially when the remote server can't support modern development tools!

## Preqs
- Windows : the putty package with plink
- Everyone else: Good to go.

## Features

### Core Transfer Operations
- **Multi-Selection Support**: Upload/download multiple files and folders at once
- **Directory Operations**: Upload or download entire directories with recursive copying
- **Project Operations**: Upload or download the entire project with ignore patterns
- **Smart File Handling**: Automatically detects and processes mixed selections

### Advanced Features
- **Configuration Wizard**: Interactive setup via Command Palette (`SCP-O-Nator: Setup Configuration`)
- **Connection Testing**: Verify SSH connectivity (`SCP-O-Nator: Test Connection`)
- **Error Recovery**: Retry failed transfers with one click
- **File Comparison**: Compare local vs remote files with timestamps and sizes
- **Directory Sync**: Bidirectional synchronization (upload focus)
- **Real-time Progress**: Visual progress tracking in status bar

### Legacy Server Support
- **Universal Compatibility**: Works with ANY SSH-enabled server
- **Custom Port Support**: Configure non-standard SSH ports (other than 22)
- **Legacy SCP Protocol**: Force SCP protocol for older devices like OpenWrt
- **No Server Requirements**: Just SSH access needed - no server-side installations

## Quick Start

1. **First Time Setup**: Press `Ctrl+Shift+P` → "SCP-O-Nator: Setup Configuration"
2. **Test Connection**: Press `Ctrl+Shift+P` → "SCP-O-Nator: Test Connection"
3. **Start Transferring**: Right-click files/folders → "Upload Selected" or "Download Selected"

## Keybindings

- **Upload Selected**: `Ctrl+SHIFT+S` (saves and uploads current file or selection)
- **Download Selected**: `Ctrl+D` (downloads current file or selection)

## Installation

1. **Install the Extension**: Search for `SCP-O-NATOR` in the Visual Studio Code Extensions marketplace and install it.
2. **Create a Configuration File**: Create a `.scpconfig.json` file in the root of your workspace or the directory where your files are located.

## Configuration

### Example `.scpconfig.json`

Create a file named `.scpconfig.json` and add the following content:

```json
{
  "username": "your-username",
  "host": "your-host",
  "port": 22,
  "remoteDirectory": "/path/to/remote/directory",
  "usePuttyTools": true, // Only for Windows users
  "puttyPath": "C:\\path\\to\\putty\\directory", // Only for Windows users
  "privateKey": "C:\\path\\to\\private\\key", // Path to your private key file (either OpenSSH or PuTTY format)
  "forceScpProtocol": false, // Set to true for compatibility with older devices like OpenWrt
  "preserveAttributes": false, // Set to true to maintain original file dates during transfers
  "ignore": [
    "node_modules",
    ".git",
    "*.log"
  ]
}
``` 

### Setting Up SSH Public Key Authentication

To securely access your remote server without entering a password, set up SSH public key authentication. This extension supports both OpenSSH and PuTTY key formats.

#### For Linux and macOS Users (OpenSSH Keys)

1. **Generate an SSH Key Pair**:

   Open a terminal and run:

   ```sh
   ssh-keygen -t rsa -b 4096 -C "your-email@example.com"
   ```

   Follow the prompts to save the key pair, optionally adding a passphrase for security.

2. **Copy the Public Key to the Remote Server**:

   ```sh
   ssh-copy-id username@host
   ```

   This command adds your public key to the `~/.ssh/authorized_keys` file on the remote server.

#### For Windows Users (PuTTY Keys)

1. **Generate an SSH Key Pair with PuTTYgen**:

   - Open PuTTYgen.
   - Select "Generate" and move the mouse to create randomness.
   - Save the public key and the private key (`.ppk` file). You can also export the key to OpenSSH format if needed.

2. **Copy the Public Key to the Remote Server**:

   - Open the saved public key file, copy its contents, and add it to the `~/.ssh/authorized_keys` file on your remote server. This can be done via an SSH connection or a control panel provided by your hosting provider.

3. **Using PSCP and Plink with PuTTY**:

   - Ensure that the path to your PuTTY tools (`pscp.exe` and `plink.exe`) is correctly set in the `puttyPath` field of your `.scpconfig.json`.
   - Specify the path to your `.ppk` private key file in the `privateKey` field.

### Usage

#### Uploading Files

To upload the currently open file in the editor to the remote server, press `Ctrl+U`. This will execute the upload command and transfer the file to the specified remote directory.

#### Downloading Files

To download the corresponding remote file to your local directory, press `Ctrl+D`. This will execute the download command and retrieve the file from the specified remote directory.

#### Project Operations

- **Upload Project**: Use the extension to upload all files in the workspace, respecting the ignore patterns specified in the configuration.
- **Download Project**: Downloads updates for files that already exist locally; new files not present locally will not be downloaded.

## Configuration Options

### Basic Configuration
- `username`: Your SSH username
- `host`: Remote server hostname or IP address
- `port`: SSH port (default: 22)
- `remoteDirectory`: Base directory on the remote server
- `privateKey`: Path to your SSH private key file

### Advanced Configuration
- `usePuttyTools`: Set to `true` for Windows users with PuTTY tools
- `puttyPath`: Path to PuTTY tools directory (Windows only)
- `forceScpProtocol`: Set to `true` to force SCP protocol for older devices
- `preserveAttributes`: Set to `true` to maintain original file dates during transfers
- `ignore`: Array of patterns to ignore during project transfers

## Troubleshooting

- **No active editor found**: Make sure you have a file open in the editor before using the upload or download commands.
- **Configuration file not found**: Ensure that the `.scpconfig.json` file is in the root of your workspace or the directory where your files are located.
- **SSH authentication errors**: Verify that your SSH credentials (username, private key) are correct and that the SSH server is accessible.
- **SSH passphrase prompts on Mac**: The extension now handles SSH passphrase prompts properly on macOS. If you still encounter issues, ensure your SSH key is added to the SSH agent with `ssh-add`.
- **SFTP not found error**: For older OpenWrt devices, set `"forceScpProtocol": true` in your configuration.
- **Custom port not working**: Ensure the `port` field is set correctly in your `.scpconfig.json` file.

## Support This Extension

⭐ **If this extension helps you, please consider giving it a star!** ⭐

As a solo developer, your likes and reviews really help with visibility and motivate continued development. Every star counts and helps other developers discover this tool!

- 👍 **Like the extension** in the VS Code marketplace
- ⭐ **Star the repository** on [GitHub](https://github.com/chris17453/wl-scp-o-nator)
- 📝 **Leave a review** sharing how it helps your workflow

## Contributors

Special thanks to the following contributors who have helped improve this extension:

### [@RewsterUK](https://github.com/RewsterUK)
- **Connection Improvements**: Fixed compareLocalVsRemote portOptions for Plink & SSH connections
- **File Attributes**: Added preserveAttributes feature to maintain original file dates during transfers

*Want to contribute? Check out the [Contributing](#contributing) section below!*

## Contributing

Contributions are welcome! If you encounter any issues or have feature requests, please open an issue or submit a pull request on the [GitHub repository](https://github.com/chris17453/wl-scp-o-nator).

## License

This project is licensed under the BSD 3 License. See the [LICENSE](LICENSE) file for details.
# Watkins Labs SCP-O-NATOR

**WL-SCP-O-NATOR** is a Visual Studio Code extension that allows you to upload and download files between your local machine and a remote server using SCP. This extension simplifies the process of managing files on remote servers directly from your code editor.

![Demo of SCP-O-Nator in action](./assets/demo.gif)

## Features

- **Upload Files**: Upload the currently open file in the editor to a remote server.
- **Download Files**: Download the corresponding remote file to your local directory.
- **Project Operations**: Upload or download the entire project, with support for ignore patterns.

## Keybindings

- **Upload File**: `Ctrl+U`
- **Download File**: `Ctrl+D`

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
  "remoteDirectory": "/path/to/remote/directory",
  "usePuttyTools": true, // Only for Windows users
  "puttyPath": "C:\\path\\to\\putty\\directory", // Only for Windows users
  "privateKey": "C:\\path\\to\\private\\key" // Path to your private key file (either OpenSSH or PuTTY format)
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

## Troubleshooting

- **No active editor found**: Make sure you have a file open in the editor before using the upload or download commands.
- **Configuration file not found**: Ensure that the `.scpconfig.json` file is in the root of your workspace or the directory where your files are located.
- **SSH authentication errors**: Verify that your SSH credentials (username, private key) are correct and that the SSH server is accessible.

## Contributing

Contributions are welcome! If you encounter any issues or have feature requests, please open an issue or submit a pull request on the [GitHub repository](https://github.com/chris17453/wl-scp-o-nator).

## License

This project is licensed under the BSD 3 License. See the [LICENSE](LICENSE) file for details.
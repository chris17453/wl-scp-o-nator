# Watkins Labs SCP-O-NATOR

**WL-SCP-O-NATOR** is a Visual Studio Code extension that allows you to upload, download, and synchronize files between your local machine and a remote server using SCP and RSYNC. This extension simplifies the process of managing files on remote servers directly from your code editor.

## Features

- **Upload Files**: Upload the currently open file in the editor to a remote server.
- **Download Files**: Download the corresponding remote file to your local directory.
- **Sync Files**: Synchronize files between your local and remote directories, ensuring that only newer files are transferred.

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
  "password": "your-password", // Optional, use this or privateKey
  "privateKey": "/path/to/private/key" // Optional, use this or password
}
```

### Configuration Fields

- `username`: Your SSH username.
- `host`: The remote host to connect to.
- `remoteDirectory`: The remote directory where files will be uploaded to or downloaded from.
- `password`: Your SSH password (optional, use this or `privateKey`).
- `privateKey`: Path to your SSH private key file (optional, use this or `password`).

### Example Configuration

#### Using Private Key

```json
{
  "username": "john_doe",
  "host": "example.com",
  "remoteDirectory": "/home/john_doe/projects",
  "privateKey": "/home/john_doe/.ssh/id_rsa"
}
```

#### Using Password

```json
{
  "username": "john_doe",
  "host": "example.com",
  "remoteDirectory": "/home/john_doe/projects",
  "password": "supersecretpassword"
}
```

## Usage

### Uploading Files

To upload the currently open file in the editor to the remote server, press `Ctrl+U`. This will execute the upload command and transfer the file to the specified remote directory.

### Downloading Files

To download the corresponding remote file to your local directory, press `Ctrl+D`. This will execute the download command and retrieve the file from the specified remote directory.

### Synchronizing Files

To synchronize files between your local and remote directories, press `Ctrl+S`. This will use RSYNC to ensure that only newer files are transferred in both directions.

## Troubleshooting

- **No active editor found**: Make sure you have a file open in the editor before using the upload or download commands.
- **Configuration file not found**: Ensure that the `.scpconfig.json` file is in the root of your workspace or the directory where your files are located.
- **SSH authentication errors**: Verify that your SSH credentials (username, password, private key) are correct and that the SSH server is accessible.

## Contributing

Contributions are welcome! Please feel free to submit a pull request or open an issue on the [GitHub repository](https://github.com/chris17453/wl-scp-o-nator).

Contributions are welcome! If you encounter any issues or have feature requests, please open an issue or submit a pull request on the [GitHub repository](https://github.com/chris17453/wl-scp-o-nator).

## License

This project is licensed under the BSD 3 License. See the [LICENSE](LICENSE) file for details.

# Change Log

## [Version 0.1.1]

### Bug Fixes
- **Connection Improvements**: Fixed compareLocalVsRemote portOptions for Plink & SSH connections - *Thanks to [@RewsterUK](https://github.com/RewsterUK)*

### New Features  
- **File Attributes**: Added preserveAttributes feature to maintain original file dates during transfers - *Thanks to [@RewsterUK](https://github.com/RewsterUK)*

## [Version 0.1.0] - Major Feature Release

### 🚀 New Major Features
- **Configuration Wizard**: Interactive setup with `SCP-O-Nator: Setup Configuration` command
- **Connection Testing**: `SCP-O-Nator: Test Connection` command to verify SSH connectivity
- **Smart Retry System**: `Retry Failed Transfers` command with automatic error recovery
- **File Comparison**: `Compare Local vs Remote` shows file differences and modification times
- **Directory Synchronization**: `Sync Directory` for bidirectional file synchronization
- **Real-time Progress**: Status bar shows transfer progress with live counters

### 📊 Enhanced User Experience
- **Visual Progress Tracking**: Status bar displays "SCP: 3/5 files" during transfers
- **Error Recovery**: Failed transfers show as clickable "❌ SCP: 2 failed" in status bar
- **Interactive Wizards**: Step-by-step configuration setup for all server types
- **Better Error Messages**: Detailed error reporting with suggested fixes

### 🎯 Perfect for Legacy Servers
- **Universal Compatibility**: Works with ANY SSH-enabled server
- **No Server Requirements**: Just SSH access needed - no server-side installations
- **OpenWrt & Embedded**: Optimized for router and embedded device development
- **Ancient Linux Support**: Compatible with old distributions that can't run VS Code Server

### 🛠 Command Palette Integration
- All major functions available via Command Palette (Ctrl+Shift+P)
- Quick setup with `SCP-O-Nator: Setup Configuration`
- Instant connection testing with `SCP-O-Nator: Test Connection`

## [Version 0.0.8]

### Breaking Changes
- **Simplified Commands**: Removed redundant "Upload File" and "Download File" commands
- **Unified Interface**: "Upload Selected" and "Download Selected" now handle both single and multiple selections

### Improvements
- **Streamlined Menu**: Cleaner context menu with fewer, more powerful options
- **Keybinding Transfer**: `Ctrl+Shift+S` and `Ctrl+D` now use the new unified commands
- **Better UX**: Single interface for all file/folder operations

### Documentation
- Added support request section encouraging likes and reviews for better visibility

## [Version 0.0.7]

### New Features
- **Multi-Selection Support**: Added "Upload Selected" and "Download Selected" commands to handle multiple files/folders at once
- **Smart Selection Handling**: Automatically detects and processes mixed selections of files and directories
- **Progress Tracking**: Shows progress when processing multiple items with detailed logging

### UI Improvements
- Added "Upload Selected" and "Download Selected" options to context menus
- Organized menu items into logical groups for better user experience
- Enhanced output logging with item-by-item progress tracking

## [Version 0.0.6]

### New Features
- **Directory Upload/Download**: Added support for uploading and downloading entire directories
- **Custom Port Support**: Added `port` configuration option for non-standard SSH ports
- **Force SCP Protocol**: Added `forceScpProtocol` option for compatibility with older devices (e.g., OpenWrt)
- **Enhanced Menu System**: Updated context menus to show "Files/Directory" options with smart detection

### Bug Fixes
- **macOS SSH Passphrase**: Fixed SSH passphrase handling issues on macOS (ssh_askpass errors)
- **Command Environment**: Improved SSH command execution with proper environment variables

### Configuration Updates
- Added new configuration options: `port`, `forceScpProtocol`
- Updated example configuration in README with all available options
- Enhanced documentation with troubleshooting section

## [Version 0.0.5]

- Fixed Bug: Asysnc error

## [Version 0.0.4]

- CTRL+SHIFT+S now saves and uploads the file.

## [Version 0.0.3]

- Readme Support updated.

## [Version 0.0.2]

- Support for windows using plink and putty ppk private keys

## [Version 0.0.1]

- Initial release
- support for scp with linux private key 
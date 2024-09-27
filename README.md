# Universal IR Appender

Universal IR Appender is a web-based tool designed to simplify the process of appending IR (Infrared) files to universal remote files, specifically tailored for Flipper Zero devices. This tool streamlines the management and organization of IR signals for various devices like TVs, audio players, projectors, and air conditioners.

## Features

- **User-Friendly Interface**: Clean and intuitive design for easy navigation and use.
- **Multiple Device Support**: Handles IR files for TVs, audio players, projectors, and air conditioners.
- **Bulk Processing**: Ability to select and process multiple .ir files simultaneously.
- **Real-time Progress Tracking**: Visual progress bar to monitor file processing status.
- **Detailed Summary**: Provides a comprehensive summary of processed files, including new signals, duplicates, and errors.
- **Export Functionality**: Option to export processing summary in JSON and CSV formats.
- **Clipboard Support**: Quick copy feature for sharing processing summaries.
- **Dark Mode**: Toggle between light and dark themes for comfortable viewing in different environments.
- **Responsive Design**: Optimized for both desktop and mobile devices.

## Setup

1. Clone the repository:
   ```
   git clone https://github.com/your-username/universal-ir-appender.git
   ```
2. Navigate to the project directory:
   ```
   cd universal-ir-appender
   ```
3. Open `index.html` in a modern web browser.

Note: This tool is designed to run client-side and doesn't require a server setup.

## Usage

1. **Select Files**: Click on "Choose Folder" to select the directory containing your .ir files.
2. **Choose Device Type**: Select the appropriate device type from the dropdown menu.
3. **Process Files**: Click "Append to Universal IR File" to start processing.
4. **View Summary**: After processing, review the summary of added signals, duplicates, and any errors.
5. **Export or Copy Results**: Use the provided buttons to export the summary or copy it to your clipboard.

## File Naming Convention

For optimal device identification, name your .ir files in the format: `Brand_Model.ir`

Example: `Samsung_UN55NU7100.ir`

## Compatibility

This tool is compatible with modern web browsers that support ES6+ JavaScript features. For the best experience, use the latest versions of Chrome, Firefox, Safari, or Edge.

## Contributing

Contributions to improve Universal IR Appender are welcome. Please follow these steps:

1. Fork the repository.
2. Create a new branch: `git checkout -b feature-branch-name`.
3. Make your changes and commit them: `git commit -m 'Add some feature'`.
4. Push to the branch: `git push origin feature-branch-name`.
5. Submit a pull request.

## Acknowledgments

- This tool is designed to work with the [Flipper Zero firmware](https://github.com/flipperdevices/flipperzero-firmware) universal remote guidelines.
- Icons and design inspiration from various open-source projects.

## Support

For support, please open an issue in the GitHub issue tracker.

---

Happy IR file managing!

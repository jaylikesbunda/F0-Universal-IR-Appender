// DOM Elements
const fileInput = document.getElementById('file-input');
const deviceTypeSelect = document.getElementById('device-type');
const processButton = document.getElementById('process-btn');
const themeToggleButton = document.getElementById('theme-toggle-button');
const body = document.body;

// Base URL for local assets
const LOCAL_ASSETS_BASE_URL = 'assets/';

// Allowed buttons per device type
const allowedButtons = {
    'TV': ['Power', 'Vol_up', 'Vol_dn', 'Ch_next', 'Ch_prev', 'Mute'],
    'Audio Player': ['Power', 'Vol_up', 'Vol_dn', 'Next', 'Prev', 'Mute', 'Play', 'Pause'],
    'Projector': ['Power', 'Vol_up', 'Vol_dn', 'Mute'],
    'Air Conditioner': ['Off', 'Cool_hi', 'Cool_lo', 'Heat_hi', 'Heat_lo', 'Dh']
};

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Theme toggle
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        body.classList.remove('light-mode', 'dark-mode');
        body.classList.add(savedTheme);
        updateButtonText(savedTheme);
    }

    themeToggleButton.addEventListener('click', () => {
        const currentTheme = body.classList.contains('light-mode') ? 'light-mode' : 'dark-mode';
        const newTheme = currentTheme === 'light-mode' ? 'dark-mode' : 'light-mode';

        body.classList.remove(currentTheme);
        body.classList.add(newTheme);
        localStorage.setItem('theme', newTheme);
        updateButtonText(newTheme);
    });

    // Update file input label and check for duplicates
    fileInput.addEventListener('change', (event) => {
        const files = event.target.files;
        const fileNames = Array.from(files).map(file => file.name).join(', ') || 'Choose files...';
        fileInput.nextElementSibling.textContent = fileNames;

        // Check for duplicates
        checkForDuplicates();
    });

    // Process files
    processButton.addEventListener('click', processFiles);
});

// Update button text based on the current theme
function updateButtonText(theme) {
    themeToggleButton.textContent = theme === 'dark-mode' ? 'Switch to Light Mode' : 'Switch to Dark Mode';
}

// Function to check for duplicates when files are selected
function checkForDuplicates() {
    const files = fileInput.files;

    if (files.length === 0) {
        // No files selected, nothing to check
        return;
    }

    const deviceTypeName = deviceTypeSelect.options[deviceTypeSelect.selectedIndex].text;
    const deviceTypeFileName = deviceTypeSelect.value;

    // Get allowed buttons for the selected device type
    const allowedButtonNames = allowedButtons[deviceTypeName];

    // Construct the URL to fetch the universal IR file from local assets
    const universalIRFileUrl = `${LOCAL_ASSETS_BASE_URL}${deviceTypeFileName}`;

    // Fetch the universal IR file
    fetch(universalIRFileUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Failed to load ${deviceTypeFileName} from assets.`);
            }
            return response.text();
        })
        .then(universalIRContent => {
            // Parse existing signals to build the index
            const existingSignalsIndex = parseUniversalIRFile(universalIRContent);

            // Read all selected .ir files
            const fileReadPromises = Array.from(files).map(file => readFileContent(file));
            Promise.all(fileReadPromises)
                .then(fileContents => {
                    let duplicatesFound = false;
                    let newSignalsFound = false;

                    fileContents.forEach(content => {
                        const signals = parseIRFileSignals(content, allowedButtonNames);

                        signals.forEach(signal => {
                            if (isDuplicateSignal(signal, existingSignalsIndex)) {
                                duplicatesFound = true;
                            } else {
                                newSignalsFound = true;
                            }
                        });
                    });

                    // Display a message based on the result
                    if (duplicatesFound && !newSignalsFound) {
                        alert('All signals in the selected files are duplicates and already exist in the universal IR file.');
                    } else if (duplicatesFound && newSignalsFound) {
                        alert('Some signals are duplicates and will be skipped. New signals found will be added.');
                    } else if (!duplicatesFound && newSignalsFound) {
                        alert('All signals are new and will be added to the universal IR file.');
                    } else {
                        alert('No valid signals found in the selected files.');
                    }
                })
                .catch(error => {
                    console.error('Error reading files:', error);
                });
        })
        .catch(error => {
            alert(error.message);
        });
}

// Function to process files and append to universal IR file
function processFiles() {
    const files = fileInput.files;

    if (files.length === 0) {
        alert('Please select at least one .ir file.');
        return;
    }

    const deviceTypeName = deviceTypeSelect.options[deviceTypeSelect.selectedIndex].text;
    const deviceTypeFileName = deviceTypeSelect.value;

    // Get allowed buttons for the selected device type
    const allowedButtonNames = allowedButtons[deviceTypeName];

    // Construct the URL to fetch the universal IR file from local assets
    const universalIRFileUrl = `${LOCAL_ASSETS_BASE_URL}${deviceTypeFileName}`;

    // Read the universal IR file from local assets
    fetch(universalIRFileUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Failed to load ${deviceTypeFileName} from assets.`);
            }
            return response.text();
        })
        .then(universalIRContent => {
            // Parse existing signals to build the index
            const existingSignalsIndex = parseUniversalIRFile(universalIRContent);

            // Ensure the existing content ends properly
            universalIRContent = universalIRContent.trim();

            // Remove any trailing '#' characters and whitespace
            while (universalIRContent.endsWith('#') || universalIRContent.endsWith('\n')) {
                universalIRContent = universalIRContent.slice(0, -1).trimEnd();
            }

            // Add a single '#' delimiter to end the existing content
            universalIRContent += '\n#';

            // Read all selected .ir files
            const fileReadPromises = Array.from(files).map(file => readFileContent(file));
            Promise.all(fileReadPromises)
                .then(fileContents => {
                    // Append each file's content to the universal IR file content
                    let updatedContent = universalIRContent;

                    Array.from(files).forEach((file, index) => {
                        const content = fileContents[index];
                        const fileName = file.name;
                        const deviceInfo = extractDeviceInfo(content, fileName);
                        const filteredContent = filterIRContent(content, allowedButtonNames, existingSignalsIndex);
                        if (filteredContent) {
                            // Add a newline and the model comment line with a following '#'
                            const commentLine = `\n# Model: ${deviceInfo}\n#\n`;
                            // Append the comment and filtered content
                            updatedContent += `${commentLine}${filteredContent.trim()}`;
                        }
                    });

                    // Ensure the final content ends with a single '#'
                    updatedContent = updatedContent.trimEnd();
                    if (!updatedContent.endsWith('#')) {
                        updatedContent += '\n#';
                    }

                    // Download the updated universal IR file
                    downloadFile(updatedContent, deviceTypeFileName);
                })
                .catch(error => {
                    console.error('Error reading files:', error);
                });
        })
        .catch(error => {
            alert(error.message);
        });
}


// Helper function to read file content
function readFileContent(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = event => resolve(event.target.result);
        reader.onerror = error => reject(error);

        reader.readAsText(file);
    });
}

// Helper function to extract device info from IR file content or file name
function extractDeviceInfo(content, fileName) {
    const lines = content.split('\n');
    let brand = '';
    let model = '';
    let extractedFromContent = false;

    // Attempt to extract Brand and Model from content
    for (let line of lines) {
        line = line.trim();
        if (line.startsWith('#')) {
            if (line.includes('Brand:')) {
                const brandMatch = line.match(/Brand:\s*([^,]+)/);
                if (brandMatch) {
                    brand = brandMatch[1].trim();
                }
            }
            if (line.includes('Device Model:')) {
                const modelMatch = line.match(/Device Model:\s*([^,]+)/);
                if (modelMatch) {
                    model = modelMatch[1].trim();
                }
            }
            if (brand && model) {
                extractedFromContent = true;
                break;
            }
        }
    }

    let infoLine = `${brand} ${model}`.trim();

    // If Brand and Model are not found in content, extract from file name
    if (!infoLine) {
        const fileNameMatch = fileName.match(/^([^_]+)_([^\.]+)\.ir$/i);
        if (fileNameMatch) {
            brand = fileNameMatch[1].trim();
            model = fileNameMatch[2].trim();
            infoLine = `${brand} ${model}`;
            alert(`Brand and Model not found in content for file "${fileName}". Inferred from file name: ${infoLine}`);
        } else {
            // If file name does not match expected pattern
            infoLine = 'Unknown Device';
            console.warn(`Unable to extract Brand and Model from content or file name for file: ${fileName}`);
        }
    }

    return infoLine;
}


// Helper function to parse IR file signals
function parseIRFileSignals(content, allowedButtonNames) {
    const allowedButtonNamesLower = allowedButtonNames.map(name => name.toLowerCase());
    const lines = content.split('\n');

    let signals = [];
    let includeSignal = false;
    let currentSignal = {};

    for (let i = 0; i <= lines.length; i++) {
        let line = (i < lines.length) ? lines[i].trim() : '#'; // Ensure last signal is processed
        if (line.startsWith('#') || line === '') {
            // End of current signal
            if (includeSignal && currentSignal.name) {
                signals.push({ ...currentSignal });
            }
            // Reset for next signal
            includeSignal = false;
            currentSignal = {};
        } else {
            if (line.startsWith('name:')) {
                const buttonName = line.split(':')[1].trim();
                const buttonNameLower = buttonName.toLowerCase();
                includeSignal = allowedButtonNamesLower.includes(buttonNameLower);
                currentSignal.name = buttonName;
            } else if (includeSignal) {
                if (line.startsWith('protocol:')) {
                    currentSignal.protocol = line.split(':')[1].trim();
                } else if (line.startsWith('address:')) {
                    currentSignal.address = line.split(':')[1].trim();
                } else if (line.startsWith('command:')) {
                    currentSignal.command = line.split(':')[1].trim();
                }
            }
        }
    }

    return signals;
}

// Helper function to check if a signal is a duplicate
function isDuplicateSignal(signal, existingSignalsIndex) {
    if (signal.name && signal.protocol && signal.address && signal.command) {
        const key = generateSignalKey(signal);
        return existingSignalsIndex.has(key);
    }
    return false;
}

// Helper function to generate a unique key for a signal
function generateSignalKey(signal) {
    return `${signal.name}|${signal.protocol}|${signal.address}|${signal.command}`;
}

// Helper function to parse the universal IR file and build an index of existing signals
function parseUniversalIRFile(content) {
    const lines = content.split('\n');
    const existingSignals = new Map();

    let currentSignal = {};

    for (let i = 0; i <= lines.length; i++) {
        let line = (i < lines.length) ? lines[i].trim() : '#'; // Ensure last signal is processed
        if (line.startsWith('#') || line === '') {
            // End of signal
            if (currentSignal.name && currentSignal.protocol && currentSignal.address && currentSignal.command) {
                const key = generateSignalKey(currentSignal);
                existingSignals.set(key, true);
            }
            currentSignal = {};
        } else {
            if (line.startsWith('name:')) {
                currentSignal.name = line.split(':')[1].trim();
            } else if (line.startsWith('protocol:')) {
                currentSignal.protocol = line.split(':')[1].trim();
            } else if (line.startsWith('address:')) {
                currentSignal.address = line.split(':')[1].trim();
            } else if (line.startsWith('command:')) {
                currentSignal.command = line.split(':')[1].trim();
            }
        }
    }

    return existingSignals;
}

// Helper function to filter IR content and remove duplicates
function filterIRContent(content, allowedButtonNames, existingSignalsIndex) {
    const allowedButtonNamesLower = allowedButtonNames.map(name => name.toLowerCase());
    const lines = content.split('\n');
    let filteredContent = '';

    let signalLines = [];
    let includeSignal = false;
    let currentSignal = {};

    for (let i = 0; i <= lines.length; i++) {
        let line = (i < lines.length) ? lines[i] : '#'; // Do not trim here to preserve formatting
        if (line.trim().startsWith('#') || line.trim() === '') {
            // End of current signal
            if (includeSignal && signalLines.length > 0) {
                // Check for duplicate
                if (!isDuplicateSignal(currentSignal, existingSignalsIndex)) {
                    // Add signal to filtered content
                    filteredContent += signalLines.join('\n') + '\n#\n';
                    // Do NOT update existingSignalsIndex here to allow multiple files to add same new signals
                } else {
                    console.log(`Duplicate signal found: ${currentSignal.name}, skipping.`);
                }
            }
            // Reset for next signal
            signalLines = [];
            includeSignal = false;
            currentSignal = {};
        } else {
            if (line.trim().startsWith('name:')) {
                const buttonName = line.split(':')[1].trim();
                const buttonNameLower = buttonName.toLowerCase();
                includeSignal = allowedButtonNamesLower.includes(buttonNameLower);
                currentSignal.name = buttonName;
                if (includeSignal) {
                    signalLines.push(line);
                }
            } else if (includeSignal) {
                signalLines.push(line);
                if (line.trim().startsWith('protocol:')) {
                    currentSignal.protocol = line.split(':')[1].trim();
                } else if (line.trim().startsWith('address:')) {
                    currentSignal.address = line.split(':')[1].trim();
                } else if (line.trim().startsWith('command:')) {
                    currentSignal.command = line.split(':')[1].trim();
                }
            }
        }
    }

    return filteredContent.trim();
}


// Helper function to download the updated file
function downloadFile(content, filename) {
    const blob = new Blob([content], { type: "text/plain" });
    const link = document.createElement("a");

    link.href = URL.createObjectURL(blob);
    link.download = filename;

    document.body.appendChild(link);
    link.click();

    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
}

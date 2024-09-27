// DOM Elements
const fileInput = document.getElementById('file-input');
const deviceTypeSelect = document.getElementById('device-type');
const processButton = document.getElementById('process-btn');
const themeToggleButton = document.getElementById('theme-toggle-button');
const body = document.body;

// Progress Elements
const progressContainer = document.getElementById('progress-container');
const progressBar = document.getElementById('progress-bar');

// Summary Elements
const summary = document.getElementById('summary');
const totalFilesElem = document.getElementById('total-files');
const totalSignalsElem = document.getElementById('total-signals');
const newSignalsElem = document.getElementById('new-signals');
const duplicateSignalsElem = document.getElementById('duplicate-signals');
const errorSignalsElem = document.getElementById('error-signals');

// Notification Element
const notification = document.getElementById('notification');

// Export and Copy Buttons
const exportSummaryBtn = document.getElementById('export-summary-btn');
const copySummaryBtn = document.getElementById('copy-summary-btn');

// File Count and Browser Warning
const fileCountElem = document.getElementById('file-count');
const browserWarningElem = document.getElementById('browser-warning');

// Base URL for local assets
const LOCAL_ASSETS_BASE_URL = 'assets/';

// Allowed buttons per device type
const allowedButtons = {
    'TV': ['Power', 'Vol_up', 'Vol_dn', 'Ch_next', 'Ch_prev', 'Mute'],
    'Audio Player': ['Power', 'Vol_up', 'Vol_dn', 'Next', 'Prev', 'Mute', 'Play', 'Pause'],
    'Projector': ['Power', 'Vol_up', 'Vol_dn', 'Mute'],
    'Air Conditioner': ['Off', 'Cool_hi', 'Cool_lo', 'Heat_hi', 'Heat_lo', 'Dh']
};

// Add these constants at the top of your file
const GITHUB_API_BASE = 'https://api.github.com/repos/flipperdevices/flipperzero-firmware';
const IR_ASSETS_PATH = 'contents/applications/main/infrared/resources/infrared/assets';
const BRANCH = 'dev';

// New function to fetch universal IR file content from GitHub
async function fetchUniversalIRFile(deviceTypeFileName) {
    const url = `${GITHUB_API_BASE}/${IR_ASSETS_PATH}/${deviceTypeFileName}?ref=${BRANCH}`;
    try {
        const response = await fetch(url, {
            headers: {
                'Accept': 'application/vnd.github.v3+json',
                'User-Agent': 'YourAppName/1.0' // Replace with your app name and version
            }
        });
        if (!response.ok) {
            if (response.status === 403 && response.headers.get('X-RateLimit-Remaining') === '0') {
                throw new Error('GitHub API rate limit exceeded. Please try again later.');
            }
            throw new Error(`GitHub API request failed: ${response.statusText}`);
        }
        const data = await response.json();
        return atob(data.content); // Decode base64 content
    } catch (error) {
        console.error('Error fetching universal IR file from GitHub:', error);
        throw error;
    }
}
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

    // Check for 'webkitdirectory' support
    const supportsWebkitDirectory = 'webkitdirectory' in document.createElement('input');
    if (!supportsWebkitDirectory) {
        browserWarningElem.style.display = 'block';
        // Optionally, modify the file input to allow multiple file selection
        // e.g., remove 'webkitdirectory' attribute
        // This requires adjusting the HTML or dynamically modifying the attribute
    }

    // Update file input label and display file count
    fileInput.addEventListener('change', (event) => {
        const files = event.target.files;

        // Filter out non-.ir files
        const irFiles = Array.from(files).filter(file => file.name.toLowerCase().endsWith('.ir'));
        const fileCount = irFiles.length;
        fileCountElem.textContent = `${fileCount} .ir file${fileCount !== 1 ? 's' : ''} selected`;

        // Update summary counts (Total Files Selected)
        totalFilesElem.textContent = fileCount;

        // Optionally, reset summary if new files are selected
        resetSummary();
    });

    // Process files
    processButton.addEventListener('click', () => {
        const files = Array.from(fileInput.files).filter(file => file.name.toLowerCase().endsWith('.ir'));
        processFiles(files);
    });

    // Export summary
    exportSummaryBtn.addEventListener('click', exportSummary);

    // Copy summary
    copySummaryBtn.addEventListener('click', copySummaryToClipboard);
});

// Update button text based on the current theme
function updateButtonText(theme) {
    themeToggleButton.textContent = theme === 'dark-mode' ? 'Switch to Light Mode' : 'Switch to Dark Mode';
}

// Function to display notifications using classList
function showNotification(message, type = 'info') {
    // Remove existing type classes
    notification.classList.remove('success', 'error', 'info');
    // Add new type class
    notification.classList.add(type);
    notification.textContent = message;
    notification.classList.add('show');

    // Automatically hide the notification after 5 seconds
    setTimeout(() => {
        notification.classList.remove('show');
    }, 5000);
}
// Updated processFiles function
async function processFiles(irFiles) {
    if (irFiles.length === 0) {
        showNotification('No .ir files selected. Please choose a folder containing .ir files.', 'error');
        return;
    }

    const deviceTypeName = deviceTypeSelect.options[deviceTypeSelect.selectedIndex].text;
    const deviceTypeFileName = deviceTypeSelect.value;

    // Get allowed buttons for the selected device type
    const allowedButtonNames = allowedButtons[deviceTypeName];

    // Disable the process button to prevent multiple submissions
    processButton.disabled = true;

    // Reset and show progress bar and summary
    resetProgress();
    progressContainer.style.display = 'block';
    summary.classList.remove('show'); // Hide summary with opacity transition
    const detailedSummaryData = []; // Array to hold per-file summary

    // Initialize counters for summary
    let totalSignals = 0;
    let newSignals = 0;
    let duplicateSignals = 0;
    let errorSignals = 0;

    // Track processed files with unique identifiers (e.g., file paths if available)
    const processedFiles = new Set();

    try {
        // Fetch the universal IR file from GitHub
        let universalIRContent = await fetchUniversalIRFile(deviceTypeFileName);

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

        // Process each .ir file sequentially
        for (let i = 0; i < irFiles.length; i++) {
            const file = irFiles[i];

            // Generate a unique identifier for the file (e.g., name + size)
            const fileIdentifier = `${file.name}-${file.size}`;
            if (processedFiles.has(fileIdentifier)) {
                console.warn(`File "${file.name}" has already been processed. Skipping.`);
                duplicateSignals += 1; // Increment duplicate signals count
                continue;
            }
            processedFiles.add(fileIdentifier);

            let fileNewSignals = 0;
            let fileDuplicateSignals = 0;
            let fileErrorSignals = 0;
            let fileErrorMessages = [];
            const stats = { duplicateCount: 0 }; // Object to track duplicates

            try {
                const content = await readFileContent(file);
                const fileName = file.name;
                const deviceInfo = extractDeviceInfo(content, fileName);
                const filteredContent = filterIRContent(content, allowedButtonNames, existingSignalsIndex, stats);

                if (filteredContent) {
                    const commentLine = `# Model: ${deviceInfo}\n#\n`;
                    universalIRContent += `${commentLine}${filteredContent.trim()}\n`;

                    // Parse signals to update counts
                    const signals = parseIRFileSignals(filteredContent, allowedButtonNames);
                    fileNewSignals = signals.length;
                    newSignals += fileNewSignals;
                    duplicateSignals += stats.duplicateCount;

                    // Update existingSignalsIndex to prevent duplicates within the same batch
                    signals.forEach(signal => {
                        const key = generateSignalKey(signal);
                        existingSignalsIndex.set(key, true);
                    });
                }

                // Update progress
                updateProgress(((i + 1) / irFiles.length) * 100);
            } catch (fileError) {
                console.error(`Error processing file "${file.name}":`, fileError);
                fileErrorMessages.push(fileError.message);
                fileErrorSignals++;
                errorSignals++;
            }

            // Push per-file summary data
            detailedSummaryData.push({
                fileName: file.name,
                newSignals: fileNewSignals,
                duplicateSignals: stats.duplicateCount,
                errorSignals: fileErrorSignals,
                errorMessages: fileErrorMessages
            });
        }

        // Update overall summary counts
        const totalProcessedFiles = irFiles.length;
        totalSignals = newSignals + duplicateSignals;
        totalSignalsElem.textContent = totalSignals;
        newSignalsElem.textContent = newSignals;
        duplicateSignalsElem.textContent = duplicateSignals;
        errorSignalsElem.textContent = errorSignals;

        // Populate detailed summary
        populateDetailedSummary(detailedSummaryData);

        // Show summary with opacity transition
        summary.classList.add('show');

        // Enable export and copy buttons
        exportSummaryBtn.disabled = false;
        copySummaryBtn.disabled = false;

        // Show success notification
        showNotification('IR files have been successfully appended to the universal IR file.', 'success');

        // Download the updated universal IR file with a descriptive name
        const downloadFileName = `universal-ir-${deviceTypeName.replace(/\s+/g, '-').toLowerCase()}.ir`;
        downloadFile(universalIRContent, downloadFileName);
    } catch (error) {
        console.error('Error during processing:', error);
        showNotification(error.message, 'error');
    } finally {
        // Re-enable the process button
        processButton.disabled = false;
        // Hide progress bar after completion
        progressContainer.style.display = 'none';
    }
}

// Helper function to reset progress indicators and summary
function resetProgress() {
    progressBar.style.width = '0%';
    progressBar.textContent = '0%';
    totalFilesElem.textContent = 0;
    totalSignalsElem.textContent = 0;
    newSignalsElem.textContent = 0;
    duplicateSignalsElem.textContent = 0;
    errorSignalsElem.textContent = 0;
    summary.classList.remove('show');
    const detailedSummaryContainer = document.getElementById('detailed-summary');
    if (detailedSummaryContainer) {
        detailedSummaryContainer.innerHTML = '';
        detailedSummaryContainer.style.display = 'none';
    }

    // Disable export and copy buttons until summary is available
    exportSummaryBtn.disabled = true;
    copySummaryBtn.disabled = true;
}

// Helper function to reset summary (optional)
function resetSummary() {
    totalSignalsElem.textContent = 0;
    newSignalsElem.textContent = 0;
    duplicateSignalsElem.textContent = 0;
    errorSignalsElem.textContent = 0;
    summary.classList.remove('show');

    // Disable export and copy buttons until summary is available
    exportSummaryBtn.disabled = true;
    copySummaryBtn.disabled = true;
}

// Helper function to update progress bar
function updateProgress(percent) {
    progressBar.style.width = `${percent}%`;
    progressBar.textContent = `${Math.floor(percent)}%`;
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
            console.info(`Brand and Model not found in content for file "${fileName}". Inferred from file name: ${infoLine}`);
        } else {
            // Fallback: Use entire filename without extension
            const baseName = fileName.replace(/\.ir$/i, '');
            infoLine = baseName;
            console.warn(`Unable to extract Brand and Model from content or file name for file: ${fileName}. Using filename as device identifier.`);
            showNotification(`Device info for "${fileName}" was inferred from the filename. Consider naming files as "Brand_Model.ir" for better organization.`, 'info');
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
                // Add more properties if necessary
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
function filterIRContent(content, allowedButtonNames, existingSignalsIndex, stats) {
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
                } else {
                    console.log(`Duplicate signal found: ${currentSignal.name}, skipping.`);
                    stats.duplicateCount++; // Increment duplicate count
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

// Helper function to populate detailed summary
function populateDetailedSummary(detailedData) {
    const detailedSummaryContainer = document.getElementById('detailed-summary');

    if (detailedData.length === 0) {
        detailedSummaryContainer.innerHTML = '<p>No detailed information available.</p>';
        detailedSummaryContainer.style.display = 'block';
        return;
    }

    // Create a table
    const table = document.createElement('table');

    // Create table header
    const headerRow = document.createElement('tr');
    const headers = ['File Name', 'New Signals', 'Duplicate Signals', 'Errors', 'Error Messages'];
    headers.forEach(headerText => {
        const th = document.createElement('th');
        th.textContent = headerText;
        headerRow.appendChild(th);
    });
    table.appendChild(headerRow);

    // Create table rows
    detailedData.forEach(data => {
        const row = document.createElement('tr');

        const fileNameCell = document.createElement('td');
        fileNameCell.textContent = data.fileName;
        row.appendChild(fileNameCell);

        const newSignalsCell = document.createElement('td');
        newSignalsCell.textContent = data.newSignals;
        newSignalsCell.classList.add('success');
        row.appendChild(newSignalsCell);

        const duplicateSignalsCell = document.createElement('td');
        duplicateSignalsCell.textContent = data.duplicateSignals;
        duplicateSignalsCell.classList.add('warning');
        row.appendChild(duplicateSignalsCell);

        const errorSignalsCell = document.createElement('td');
        errorSignalsCell.textContent = data.errorSignals;
        errorSignalsCell.classList.add('error');
        row.appendChild(errorSignalsCell);

        const errorMessagesCell = document.createElement('td');
        if (data.errorMessages.length > 0) {
            errorMessagesCell.innerHTML = data.errorMessages.map(msg => `<p>${msg}</p>`).join('');
            errorMessagesCell.classList.add('error');
        } else {
            errorMessagesCell.textContent = '-';
        }
        row.appendChild(errorMessagesCell);

        table.appendChild(row);
    });

    // Clear any existing content and append the table
    detailedSummaryContainer.innerHTML = '';
    detailedSummaryContainer.appendChild(table);
    detailedSummaryContainer.style.display = 'block';
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

// Function to export summary as JSON and CSV
function exportSummary() {
    const summaryData = {
        totalFiles: totalFilesElem.textContent,
        totalSignals: totalSignalsElem.textContent,
        newSignals: newSignalsElem.textContent,
        duplicateSignals: duplicateSignalsElem.textContent,
        errorSignals: errorSignalsElem.textContent,
        detailedSummary: []
    };

    const detailedRows = document.querySelectorAll('#detailed-summary table tr');
    detailedRows.forEach((row, index) => {
        if (index === 0) return; // Skip header
        const cells = row.querySelectorAll('td');
        summaryData.detailedSummary.push({
            fileName: cells[0].textContent,
            newSignals: cells[1].textContent,
            duplicateSignals: cells[2].textContent,
            errorSignals: cells[3].textContent,
            errorMessages: cells[4].innerText.trim() !== '-' ? cells[4].innerText.trim() : ''
        });
    });

    // Create JSON export
    const jsonBlob = new Blob([JSON.stringify(summaryData, null, 2)], { type: "application/json" });
    const jsonLink = document.createElement("a");
    jsonLink.href = URL.createObjectURL(jsonBlob);
    jsonLink.download = "processing-summary.json";
    document.body.appendChild(jsonLink);
    jsonLink.click();
    document.body.removeChild(jsonLink);

    // Create CSV export
    const csvContent = convertSummaryToCSV(summaryData);
    const csvBlob = new Blob([csvContent], { type: "text/csv" });
    const csvLink = document.createElement("a");
    csvLink.href = URL.createObjectURL(csvBlob);
    csvLink.download = "processing-summary.csv";
    document.body.appendChild(csvLink);
    csvLink.click();
    document.body.removeChild(csvLink);
}

// Helper function to convert summary data to CSV
function convertSummaryToCSV(summaryData) {
    let csvContent = `Total Files Processed,${summaryData.totalFiles}\n`;
    csvContent += `Total Signals,${summaryData.totalSignals}\n`;
    csvContent += `New Signals,${summaryData.newSignals}\n`;
    csvContent += `Duplicate Signals,${summaryData.duplicateSignals}\n`;
    csvContent += `Errors,${summaryData.errorSignals}\n\n`;
    csvContent += `File Name,New Signals,Duplicate Signals,Errors,Error Messages\n`;

    summaryData.detailedSummary.forEach(file => {
        // Escape double quotes by doubling them
        const escapedFileName = file.fileName.replace(/"/g, '""');
        const escapedErrorMessages = file.errorMessages.replace(/"/g, '""');
        csvContent += `"${escapedFileName}",${file.newSignals},${file.duplicateSignals},${file.errorSignals},"${escapedErrorMessages}"\n`;
    });

    return csvContent;
}

// Function to copy summary to clipboard with fallback
function copySummaryToClipboard() {
    let summaryText = `Processing Summary:\n`;
    summaryText += `Total Files Processed: ${totalFilesElem.textContent}\n`;
    summaryText += `Total Signals: ${totalSignalsElem.textContent}\n`;
    summaryText += `New Signals: ${newSignalsElem.textContent}\n`;
    summaryText += `Duplicate Signals: ${duplicateSignalsElem.textContent}\n`;
    summaryText += `Errors: ${errorSignalsElem.textContent}\n\n`;
    summaryText += `Detailed Summary:\n`;

    const detailedRows = document.querySelectorAll('#detailed-summary table tr');
    detailedRows.forEach((row, index) => {
        if (index === 0) return; // Skip header
        const cells = row.querySelectorAll('td');
        summaryText += `File: ${cells[0].textContent}, New: ${cells[1].textContent}, Duplicates: ${cells[2].textContent}, Errors: ${cells[3].textContent}`;
        if (cells[4].textContent !== '-') {
            summaryText += `, Error Messages: ${cells[4].textContent}`;
        }
        summaryText += `\n`;
    });

    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(summaryText).then(() => {
            showNotification('Summary copied to clipboard!', 'success');
        }).catch(err => {
            console.error('Failed to copy summary:', err);
            showNotification('Failed to copy summary.', 'error');
        });
    } else {
        // Fallback method using a temporary textarea
        const textarea = document.createElement('textarea');
        textarea.value = summaryText;
        document.body.appendChild(textarea);
        textarea.select();
        try {
            const successful = document.execCommand('copy');
            if (successful) {
                showNotification('Summary copied to clipboard!', 'success');
            } else {
                throw new Error('Copy command was unsuccessful');
            }
        } catch (err) {
            console.error('Fallback: Oops, unable to copy', err);
            showNotification('Failed to copy summary.', 'error');
        }
        document.body.removeChild(textarea);
    }
}

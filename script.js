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

// Allowed buttons per device type
const allowedButtons = {
    'TV': ['Power', 'Vol_up', 'Vol_dn', 'Ch_next', 'Ch_prev', 'Mute'],
    'Audio Player': ['Power', 'Vol_up', 'Vol_dn', 'Next', 'Prev', 'Mute', 'Play', 'Pause'],
    'Projector': ['Power', 'Vol_up', 'Vol_dn', 'Mute'],
    'Air Conditioner': ['Off', 'Cool_hi', 'Cool_lo', 'Heat_hi', 'Heat_lo', 'Dh']
};

// GitHub API constants
const GITHUB_API_BASE = 'https://api.github.com/repos/flipperdevices/flipperzero-firmware';
const IR_ASSETS_PATH = 'contents/applications/main/infrared/resources/infrared/assets';
const BRANCH = 'dev';

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
    }

    // Update file input label and display file count
    fileInput.addEventListener('change', (event) => {
        const files = event.target.files;
        const irFiles = Array.from(files).filter(file => file.name.toLowerCase().endsWith('.ir'));
        const fileCount = irFiles.length;
        fileCountElem.textContent = `${fileCount} .ir file${fileCount !== 1 ? 's' : ''} selected`;
        totalFilesElem.textContent = fileCount;
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

// Function to display notifications
function showNotification(message, type = 'info') {
    notification.classList.remove('success', 'error', 'info');
    notification.classList.add(type);
    notification.textContent = message;
    notification.classList.add('show');
    setTimeout(() => {
        notification.classList.remove('show');
    }, 5000);
}

// New function to fetch universal IR file content from GitHub
async function fetchUniversalIRFile(deviceTypeFileName) {
    const url = `${GITHUB_API_BASE}/${IR_ASSETS_PATH}/${deviceTypeFileName}?ref=${BRANCH}`;
    try {
        const response = await fetch(url, {
            headers: {
                'Accept': 'application/vnd.github.v3+json',
                'User-Agent': 'UniversalIRAppender/1.0'
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

async function processFiles(irFiles) {
    if (irFiles.length === 0) {
        showNotification('No .ir files selected. Please choose a folder containing .ir files.', 'error');
        return;
    }

    const deviceTypeName = deviceTypeSelect.options[deviceTypeSelect.selectedIndex].text;
    const deviceTypeFileName = deviceTypeSelect.value;
    const allowedButtonNames = allowedButtons[deviceTypeName];

    processButton.disabled = true;
    resetProgress();
    progressContainer.style.display = 'block';
    summary.classList.remove('show');
    const detailedSummaryData = [];
    let totalButtonCounts = {};

    let totalSignals = 0;
    let newSignals = 0;
    let duplicateSignals = 0;
    let errorSignals = 0;
    let totalUnnamedRaw = 0;

    const processedFiles = new Set();

    try {
        showNotification('Fetching latest universal IR file...', 'info');
        let universalIRContent = await fetchUniversalIRFile(deviceTypeFileName);
        showNotification('Universal IR file successfully loaded.', 'success');

        const existingSignalsIndex = parseUniversalIRFile(universalIRContent);

        universalIRContent = universalIRContent.trim();
        while (universalIRContent.endsWith('#') || universalIRContent.endsWith('\n')) {
            universalIRContent = universalIRContent.slice(0, -1).trimEnd();
        }
        universalIRContent += '\n#';

        for (let i = 0; i < irFiles.length; i++) {
            const file = irFiles[i];
            const fileIdentifier = `${file.name}-${file.size}`;
            if (processedFiles.has(fileIdentifier)) {
                console.warn(`File "${file.name}" has already been processed. Skipping.`);
                duplicateSignals += 1;
                continue;
            }
            processedFiles.add(fileIdentifier);

            let fileNewSignals = 0;
            let fileErrorSignals = 0;
            let fileErrorMessages = [];
            const stats = { duplicateCount: 0, buttonCounts: {}, unnamedRawCount: 0 };

            try {
                const content = await readFileContent(file);
                const deviceInfo = extractDeviceInfo(content, file.name);
                const filteredContent = filterIRContent(content, allowedButtonNames, existingSignalsIndex, stats);

                if (filteredContent) {
                    const commentLine = `# Model: ${deviceInfo}\n#\n`;
                    universalIRContent += `${commentLine}${filteredContent.trim()}\n`;

                    const signals = parseIRFileSignals(filteredContent, allowedButtonNames);
                    fileNewSignals = signals.length;
                    newSignals += fileNewSignals;
                    duplicateSignals += stats.duplicateCount;
                    totalUnnamedRaw += stats.unnamedRawCount;

                    // Aggregate button counts
                    for (const [button, count] of Object.entries(stats.buttonCounts)) {
                        totalButtonCounts[button] = (totalButtonCounts[button] || 0) + count;
                    }
                }

                updateProgress(((i + 1) / irFiles.length) * 100);
            } catch (fileError) {
                console.error(`Error processing file "${file.name}":`, fileError);
                fileErrorMessages.push(fileError.message);
                fileErrorSignals++;
                errorSignals++;
            }

            detailedSummaryData.push({
                fileName: file.name,
                newSignals: fileNewSignals,
                duplicateSignals: stats.duplicateCount,
                errorSignals: fileErrorSignals,
                errorMessages: fileErrorMessages,
                buttonCounts: stats.buttonCounts,
                unnamedRawCount: stats.unnamedRawCount
            });
        }

        totalSignals = newSignals + duplicateSignals;
        totalSignalsElem.textContent = totalSignals;
        newSignalsElem.textContent = newSignals;
        duplicateSignalsElem.textContent = duplicateSignals;
        errorSignalsElem.textContent = errorSignals;
        
        // Update unnamed raw signals count in the summary
        const unnamedRawElem = document.getElementById('unnamed-raw');
        if (unnamedRawElem) {
            unnamedRawElem.textContent = totalUnnamedRaw;
        }

        populateDetailedSummary(detailedSummaryData);
        updateButtonSummary(totalButtonCounts, totalUnnamedRaw);
        summary.classList.add('show');
        exportSummaryBtn.disabled = false;
        copySummaryBtn.disabled = false;

        showNotification('IR files have been successfully appended to the universal IR file.', 'success');

        const downloadFileName = `universal-ir-${deviceTypeName.replace(/\s+/g, '-').toLowerCase()}.ir`;
        downloadFile(universalIRContent, downloadFileName);
    } catch (error) {
        console.error('Error during processing:', error);
        showNotification(error.message, 'error');
    } finally {
        processButton.disabled = false;
        progressContainer.style.display = 'none';
    }
}
// Helper functions

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
    exportSummaryBtn.disabled = true;
    copySummaryBtn.disabled = true;
}

function resetSummary() {
    totalSignalsElem.textContent = 0;
    newSignalsElem.textContent = 0;
    duplicateSignalsElem.textContent = 0;
    errorSignalsElem.textContent = 0;
    summary.classList.remove('show');
    exportSummaryBtn.disabled = true;
    copySummaryBtn.disabled = true;
}

function updateProgress(percent) {
    progressBar.style.width = `${percent}%`;
    progressBar.textContent = `${Math.floor(percent)}%`;
}

function readFileContent(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = event => resolve(event.target.result);
        reader.onerror = error => reject(error);
        reader.readAsText(file);
    });
}

function extractDeviceInfo(content, fileName) {
    const lines = content.split('\n');
    let brand = '';
    let model = '';

    for (let line of lines) {
        line = line.trim();
        if (line.startsWith('#')) {
            if (line.includes('Brand:')) {
                const brandMatch = line.match(/Brand:\s*([^,]+)/);
                if (brandMatch) brand = brandMatch[1].trim();
            }
            if (line.includes('Device Model:')) {
                const modelMatch = line.match(/Device Model:\s*([^,]+)/);
                if (modelMatch) model = modelMatch[1].trim();
            }
            if (brand && model) break;
        }
    }

    let infoLine = `${brand} ${model}`.trim();

    if (!infoLine) {
        const fileNameMatch = fileName.match(/^([^_]+)_([^\.]+)\.ir$/i);
        if (fileNameMatch) {
            brand = fileNameMatch[1].trim();
            model = fileNameMatch[2].trim();
            infoLine = `${brand} ${model}`;
            console.info(`Brand and Model not found in content for file "${fileName}". Inferred from file name: ${infoLine}`);
        } else {
            infoLine = fileName.replace(/\.ir$/i, '');
            console.warn(`Unable to extract Brand and Model from content or file name for file: ${fileName}. Using filename as device identifier.`);
            showNotification(`Device info for "${fileName}" was inferred from the filename. Consider naming files as "Brand_Model.ir" for better organization.`, 'info');
        }
    }

    return infoLine;
}

// Improved helper function to generate a unique key for a signal
function generateSignalKey(signal) {
    if (signal.raw) {
        // For raw signals, use a hash of the raw data as the key
        return 'raw_' + hashString(signal.raw);
    }
    const normalizedName = (signal.name || '').toLowerCase().trim();
    const normalizedProtocol = (signal.protocol || '').toLowerCase().trim();
    const normalizedAddress = (signal.address || '').toLowerCase().trim();
    const normalizedCommand = (signal.command || '').toLowerCase().trim();
    return `${normalizedName}|${normalizedProtocol}|${normalizedAddress}|${normalizedCommand}`;
}

// Simple hash function for raw data
function hashString(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString(36); // Convert to base 36 for shorter string
}

function isDuplicateSignal(signal, existingSignalsIndex) {
    if (signal.raw || (signal.name && signal.protocol && signal.address && signal.command)) {
        const key = generateSignalKey(signal);
        return existingSignalsIndex.has(key);
    }
    return false;
}

function parseUniversalIRFile(content) {
    const lines = content.split('\n');
    const existingSignals = new Map();
    let currentSignal = {};
    let isRawSignal = false;
    let rawLines = [];

    for (let i = 0; i <= lines.length; i++) {
        let line = (i < lines.length) ? lines[i].trim() : '#';
        if (line.startsWith('#') || line === '') {
            if (isValidSignal(currentSignal)) {
                const key = generateSignalKey(currentSignal);
                existingSignals.set(key, currentSignal);
            }
            currentSignal = {};
            isRawSignal = false;
            rawLines = [];
        } else {
            if (line.startsWith('name:')) currentSignal.name = line.split(':')[1].trim();
            else if (line.startsWith('type: raw')) {
                isRawSignal = true;
                rawLines.push(line);
            } else if (isRawSignal) {
                rawLines.push(line);
            } else {
                if (line.startsWith('protocol:')) currentSignal.protocol = line.split(':')[1].trim();
                else if (line.startsWith('address:')) currentSignal.address = line.split(':')[1].trim();
                else if (line.startsWith('command:')) currentSignal.command = line.split(':')[1].trim();
            }
        }
        
        if (isRawSignal && (i === lines.length || lines[i+1].trim().startsWith('#'))) {
            currentSignal.raw = rawLines.join('\n');
        }
    }

    return existingSignals;
}
// Improved helper function to parse IR file signals
function parseIRFileSignals(content, allowedButtonNames) {
    const allowedButtonNamesLower = new Set(allowedButtonNames.map(name => name.toLowerCase()));
    const lines = content.split('\n');
    let signals = [];
    let includeSignal = false;
    let currentSignal = {};

    for (let i = 0; i <= lines.length; i++) {
        let line = (i < lines.length) ? lines[i].trim() : '#';
        if (line.startsWith('#') || line === '') {
            if (includeSignal && currentSignal.name) {
                signals.push({ ...currentSignal });
            }
            includeSignal = false;
            currentSignal = {};
        } else {
            if (line.startsWith('name:')) {
                const buttonName = line.split(':')[1].trim();
                includeSignal = allowedButtonNamesLower.has(buttonName.toLowerCase());
                currentSignal.name = buttonName;
            } else if (includeSignal) {
                if (line.startsWith('protocol:')) currentSignal.protocol = line.split(':')[1].trim();
                else if (line.startsWith('address:')) currentSignal.address = line.split(':')[1].trim();
                else if (line.startsWith('command:')) currentSignal.command = line.split(':')[1].trim();
            }
        }
    }

    return signals;
}

function filterIRContent(content, allowedButtonNames, existingSignalsIndex, stats) {
    const allowedButtonNamesLower = new Set(allowedButtonNames.map(name => name.toLowerCase()));
    const lines = content.split('\n');
    let filteredContent = '';
    let signalLines = [];
    let includeSignal = false;
    let currentSignal = {};
    let isRawSignal = false;
    const buttonCounts = {};
    let rawSignalCounter = 0;

    for (let i = 0; i <= lines.length; i++) {
        let line = (i < lines.length) ? lines[i] : '#';
        if (line.trim().startsWith('#') || line.trim() === '') {
            if (signalLines.length > 0) {
                if (isRawSignal && !currentSignal.name) {
                    // Assign a default name for unnamed raw signals
                    currentSignal.name = generateDefaultRawName(++rawSignalCounter);
                    signalLines.unshift(`name: ${currentSignal.name}`);
                }
                
                if (isValidSignal(currentSignal)) {
                    const normalizedName = normalizeButtonName(currentSignal.name);
                    if (!isDuplicateSignal(currentSignal, existingSignalsIndex)) {
                        // Update the name in the signal lines to the normalized version
                        signalLines = signalLines.map(sl => 
                            sl.startsWith('name:') ? `name: ${normalizedName}` : sl
                        );
                        filteredContent += signalLines.join('\n') + '\n#\n';
                        const key = generateSignalKey({...currentSignal, name: normalizedName});
                        existingSignalsIndex.set(key, {...currentSignal, name: normalizedName});
                        if (allowedButtonNamesLower.has(normalizedName.toLowerCase())) {
                            buttonCounts[normalizedName] = (buttonCounts[normalizedName] || 0) + 1;
                        }
                    } else {
                        console.log(`Duplicate signal found: ${normalizedName}, skipping.`);
                        stats.duplicateCount++;
                    }
                }
            }
            signalLines = [];
            includeSignal = false;
            currentSignal = {};
            isRawSignal = false;
        } else {
            if (line.trim().startsWith('name:')) {
                const buttonName = line.split(':')[1].trim();
                const normalizedName = normalizeButtonName(buttonName);
                includeSignal = allowedButtonNamesLower.has(normalizedName.toLowerCase());
                currentSignal.name = normalizedName;
                signalLines.push(`name: ${normalizedName}`);
            } else if (line.trim().startsWith('type: raw')) {
                isRawSignal = true;
                includeSignal = true;
                signalLines.push(line);
            } else if (includeSignal || isRawSignal) {
                signalLines.push(line);
                if (!isRawSignal) {
                    if (line.trim().startsWith('protocol:')) currentSignal.protocol = line.split(':')[1].trim();
                    else if (line.trim().startsWith('address:')) currentSignal.address = line.split(':')[1].trim();
                    else if (line.trim().startsWith('command:')) currentSignal.command = line.split(':')[1].trim();
                }
            }
        }
    }

    stats.buttonCounts = buttonCounts;
    stats.unnamedRawCount = rawSignalCounter;
    return filteredContent.trim();
}

// Helper function to check if a signal is valid
function isValidSignal(signal) {
    return signal.raw || (signal.name && signal.protocol && signal.address && signal.command);
}

// Helper function to populate detailed summary
function populateDetailedSummary(detailedData) {
    const detailedSummaryContainer = document.getElementById('detailed-summary');

    if (detailedData.length === 0) {
        detailedSummaryContainer.innerHTML = '<p>No detailed information available.</p>';
        detailedSummaryContainer.style.display = 'block';
        return;
    }

    const table = document.createElement('table');
    const headerRow = document.createElement('tr');
    ['File Name', 'New Signals', 'Duplicate Signals', 'Errors', 'Error Messages'].forEach(headerText => {
        const th = document.createElement('th');
        th.textContent = headerText;
        headerRow.appendChild(th);
    });
    table.appendChild(headerRow);

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


function normalizeButtonName(name) {
    // Convert to lowercase and capitalize first letter of each word
    return name.toLowerCase().replace(/(^|\s)\S/g, l => l.toUpperCase());
}


function updateButtonSummary(buttonCounts, unnamedRawCount) {
    const buttonSummaryElem = document.getElementById('button-summary');
    buttonSummaryElem.innerHTML = '';
    const sortedButtons = Object.entries(buttonCounts).sort((a, b) => a[0].localeCompare(b[0]));
    for (const [button, count] of sortedButtons) {
        const buttonElem = document.createElement('div');
        buttonElem.textContent = `${button}: ${count}`;
        buttonSummaryElem.appendChild(buttonElem);
    }
    if (unnamedRawCount > 0) {
        const unnamedRawElem = document.createElement('div');
        unnamedRawElem.textContent = `Unnamed Raw Signals: ${unnamedRawCount}`;
        unnamedRawElem.style.color = 'orange';  // Highlight this information
        buttonSummaryElem.appendChild(unnamedRawElem);
    }
    if (sortedButtons.length === 0 && unnamedRawCount === 0) {
        const noButtonsElem = document.createElement('p');
        noButtonsElem.textContent = 'No supported universal buttons were added.';
        buttonSummaryElem.appendChild(noButtonsElem);
    }
}

function generateDefaultRawName(index) {
    return `Unnamed_Raw_${index}`;
}


function exportSummary() {
    const summaryData = {
        totalFiles: totalFilesElem.textContent,
        totalSignals: totalSignalsElem.textContent,
        newSignals: newSignalsElem.textContent,
        duplicateSignals: duplicateSignalsElem.textContent,
        errorSignals: errorSignalsElem.textContent,
        buttonCounts: {},
        detailedSummary: []
    };

    // Populate button counts
    const buttonSummaryElems = document.querySelectorAll('#button-summary div');
    buttonSummaryElems.forEach(elem => {
        const [button, count] = elem.textContent.split(':');
        summaryData.buttonCounts[button.trim()] = parseInt(count.trim());
    });

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

// Updated copySummaryToClipboard function
function copySummaryToClipboard() {
    let summaryText = `Processing Summary:\n`;
    summaryText += `Total Files Processed: ${totalFilesElem.textContent}\n`;
    summaryText += `Total Signals: ${totalSignalsElem.textContent}\n`;
    summaryText += `New Signals: ${newSignalsElem.textContent}\n`;
    summaryText += `Duplicate Signals: ${duplicateSignalsElem.textContent}\n`;
    summaryText += `Errors: ${errorSignalsElem.textContent}\n\n`;
    
    summaryText += `Button Summary:\n`;
    const buttonSummaryElems = document.querySelectorAll('#button-summary div');
    buttonSummaryElems.forEach(elem => {
        summaryText += `${elem.textContent}\n`;
    });
    
    summaryText += `\nDetailed Summary:\n`;
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

// Helper function to convert summary data to CSV (update if needed)
function convertSummaryToCSV(summaryData) {
    let csvContent = `Total Files Processed,${summaryData.totalFiles}\n`;
    csvContent += `Total Signals,${summaryData.totalSignals}\n`;
    csvContent += `New Signals,${summaryData.newSignals}\n`;
    csvContent += `Duplicate Signals,${summaryData.duplicateSignals}\n`;
    csvContent += `Errors,${summaryData.errorSignals}\n\n`;
    
    csvContent += `Button Counts\n`;
    for (const [button, count] of Object.entries(summaryData.buttonCounts)) {
        csvContent += `${button},${count}\n`;
    }
    csvContent += `\n`;
    
    csvContent += `File Name,New Signals,Duplicate Signals,Errors,Error Messages\n`;
    summaryData.detailedSummary.forEach(file => {
        const escapedFileName = file.fileName.replace(/"/g, '""');
        const escapedErrorMessages = file.errorMessages.replace(/"/g, '""');
        csvContent += `"${escapedFileName}",${file.newSignals},${file.duplicateSignals},${file.errorSignals},"${escapedErrorMessages}"\n`;
    });

    return csvContent;
}
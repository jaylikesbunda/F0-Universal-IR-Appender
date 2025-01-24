// utils.js

// =========================
// Utility Functions
// =========================

// Normalize button name by capitalizing first letters
function normalizeButtonName(name) {
    return name.toLowerCase().replace(/(^|\s)\S/g, l => l.toUpperCase());
}

function matchAndRenameButton(buttonName, deviceType) {
    const normalizedButton = normalizeButtonName(buttonName);
    const mappings = buttonNameMapping[deviceType.toLowerCase()] || {};

    for (const [pattern, standardName] of Object.entries(mappings)) {
        const regex = new RegExp(`^${pattern}$`, 'i');
        if (regex.test(normalizedButton)) {
            const capitalizedName = capitalizeButtonName(standardName, deviceType);
            console.log(`Renamed "${buttonName}" to "${capitalizedName}" for device type: ${deviceType}`);
            return capitalizedName;
        }
    }

    // Special case for AC "dry" button
    if (deviceType.toLowerCase() === 'ac' && normalizedButton.toLowerCase() === 'dry') {
        console.log(`Renamed "dry" to "Dh" for AC`);
        return 'Dh';
    }

    // If no match found, capitalize using the new function
    const capitalizedName = capitalizeButtonName(buttonName, deviceType);
    console.log(`No rename match found. Capitalized "${buttonName}" to "${capitalizedName}" for device type: ${deviceType}`);
    return capitalizedName;
}

function normalizeRawSignal(rawData) {
    const pulses = rawData.split(/[\s,]+/).map(Number);
    const totalTime = pulses.reduce((sum, pulse) => sum + pulse, 0);
    
    // Normalize to a fixed total (e.g., 1000) instead of 10000
    const normalizedPulses = pulses.map(pulse => Math.round((pulse / totalTime) * 1000));
    
    // Group similar pulses to reduce impact of slight timing variations
    const groupedPulses = [];
    for (let i = 0; i < normalizedPulses.length; i++) {
        if (i === 0 || Math.abs(normalizedPulses[i] - normalizedPulses[i-1]) > 5) {
            groupedPulses.push(normalizedPulses[i]);
        } else {
            groupedPulses[groupedPulses.length - 1] = Math.round((groupedPulses[groupedPulses.length - 1] + normalizedPulses[i]) / 2);
        }
    }
    
    return groupedPulses.join(',');
}
// Calculate similarity between two normalized raw signals
function calculateSimilarity(signal1, signal2) {
    const pulses1 = signal1.split(',').map(Number);
    const pulses2 = signal2.split(',').map(Number);
    
    if (Math.abs(pulses1.length - pulses2.length) > 2) {
        return 0; // Significantly different lengths, not similar
    }
    
    const minLength = Math.min(pulses1.length, pulses2.length);
    let matchCount = 0;
    
    for (let i = 0; i < minLength; i++) {
        if (Math.abs(pulses1[i] - pulses2[i]) <= 5) {
            matchCount++;
        }
    }
    
    return matchCount / minLength;
}
function toggleUniversalFileOption() {
    const selectedOption = document.querySelector('input[name="universal-file-option"]:checked').value;
    if (selectedOption === 'fetch') {
        elements.repoSelectContainer.classList.remove('hidden');
        elements.manualUploadContainer.classList.add('hidden');
    } else {
        elements.repoSelectContainer.classList.add('hidden');
        elements.manualUploadContainer.classList.remove('hidden');
    }
}

function capitalizeButtonName(buttonName, deviceType) {
    const allowedButtonsForType = allowedButtons[deviceType.toLowerCase()] || [];
    const normalizedButtonName = buttonName.toLowerCase();
    
    // Check if the button name is in the allowed buttons list (case-insensitive)
    const matchedButton = allowedButtonsForType.find(
        allowedButton => allowedButton.toLowerCase() === normalizedButtonName
    );
    
    if (matchedButton) {
        return matchedButton; // Return the exact capitalization from allowedButtons
    }
    
    // If no match found, use the original button name
    return buttonName;
}

function generateSignalKey(signal) {
    if (signal.raw) {
        const normalizedRaw = normalizeRawSignal(signal.raw);
        return `raw_${signal.frequency}_${hashString(normalizedRaw)}`;
    }

    // Existing logic for non-raw signals
    const normalizedName = (signal.name || '').toLowerCase().trim();
    const normalizedProtocol = (signal.protocol || '').toLowerCase().trim();
    const normalizedAddress = normalizeHex(signal.address || '');
    const normalizedCommand = normalizeHex(signal.command || '');

    return `${normalizedName}|${normalizedProtocol}|${normalizedAddress}|${normalizedCommand}`;
}

// Helper function to normalize hexadecimal values
function normalizeHex(value) {
    // Remove '0x' prefix if present and convert to lowercase
    let hex = value.toLowerCase().replace(/^0x/, '');
    // Pad with leading zeros to a fixed length (e.g., 4 characters)
    hex = hex.padStart(4, '0');
    return hex;
}

// Simple hash function for strings
function hashString(str) {
    let hash = 0;
    if (str.length === 0) return hash.toString();
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return hash.toString(36);
}

function isDuplicateSignal(signal, existingSignalsIndex) {
    if (signal.raw) {
        const normalizedNewRaw = normalizeRawSignal(signal.raw);
        for (const existingSignal of existingSignalsIndex.values()) {
            if (existingSignal.raw) {
                const normalizedExistingRaw = normalizeRawSignal(existingSignal.raw);
                if (isDuplicateRawSignal(
                    { normalizedRaw: normalizedNewRaw, frequency: signal.frequency },
                    { normalizedRaw: normalizedExistingRaw, frequency: existingSignal.frequency }
                )) {
                    return true;
                }
            }
        }
        return false;
    } else {
        // Existing logic for non-raw signals
        const key = generateSignalKey(signal);
        return existingSignalsIndex.has(key);
    }
}

function parseUniversalIRFile(content) {
    if (!content) {
        console.warn('Empty content provided to parseUniversalIRFile.');
        return new Map();
    }

    const lines = content.split('\n');
    const existingSignals = new Map();
    let currentSignal = {};
    let isRawSignal = false;
    let rawLines = [];
    let lineNumber = 0;

    function processCurrentSignal() {
        if (isRawSignal && rawLines.length > 0) {
            currentSignal.raw = rawLines.join('\n');
            currentSignal.normalizedRaw = normalizeRawSignal(currentSignal.raw);
        }
        if (isValidSignal(currentSignal)) {
            const key = generateSignalKey(currentSignal);
            if (existingSignals.has(key)) {
                console.warn(`Duplicate signal detected at line ${lineNumber}:`, currentSignal);
                console.warn('Existing signal:', existingSignals.get(key));
            } else {
                existingSignals.set(key, currentSignal);
                console.log(`Added signal: ${currentSignal.name || 'Unnamed'} (${key})`);
            }
        } else {
            console.warn(`Invalid signal detected at line ${lineNumber}:`, currentSignal);
        }
    }

    for (let i = 0; i <= lines.length; i++) {
        lineNumber = i + 1;
        let line = (i < lines.length) ? lines[i].trim() : '#';

        if (line.startsWith('#') || line === '' || i === lines.length) {
            // End of a signal
            processCurrentSignal();
            currentSignal = {};
            isRawSignal = false;
            rawLines = [];
        } else {
            if (line.startsWith('name:')) {
                currentSignal.name = line.split(':')[1].trim();
            } else if (line.startsWith('type: raw')) {
                isRawSignal = true;
                rawLines = [line];
            } else if (isRawSignal) {
                rawLines.push(line);
            } else {
                // Normalize and extract attributes
                const [key, ...valueParts] = line.split(':');
                const value = valueParts.join(':').trim(); // Rejoin in case the value contains colons
                switch (key.toLowerCase()) {
                    case 'protocol':
                        currentSignal.protocol = value;
                        break;
                    case 'address':
                        currentSignal.address = normalizeHex(value);
                        break;
                    case 'command':
                        currentSignal.command = normalizeHex(value);
                        break;
                    case 'frequency':
                        currentSignal.frequency = value;
                        break;
                    default:
                        // Store any additional fields
                        currentSignal[key.toLowerCase()] = value;
                }
            }
        }
    }

    console.log(`Total signals parsed: ${existingSignals.size}`);
    return existingSignals;
}

// Read file content as text
function readFileContent(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = event => resolve(event.target.result);
        reader.onerror = error => reject(error);
        reader.readAsText(file);
    });
}

// Extract device info from file content or name
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

function isDuplicateRawSignal(newSignal, existingSignal, threshold = 0.95) {
    // Check if frequencies are within 1% of each other
    const frequencyTolerance = 0.01;
    const frequencyDifference = Math.abs(newSignal.frequency - existingSignal.frequency) / existingSignal.frequency;
    
    if (frequencyDifference > frequencyTolerance) {
        return false; // Frequencies are too different
    }
    
    const similarity = calculateSimilarity(newSignal.normalizedRaw, existingSignal.normalizedRaw);
    return similarity >= threshold;
}

// Check if a signal is valid with stricter criteria
function isValidSignal(signal) {
    if (signal.raw) {
        // Ensure raw signal has sufficient data
        return signal.raw.trim().split('\n').length > 1;
    }
    // For learned signals, ensure all critical attributes are present
    return (
        signal.name &&
        signal.protocol &&
        signal.address &&
        signal.command &&
        signal.name.trim() !== '' &&
        signal.protocol.trim() !== '' &&
        signal.address.trim() !== '' &&
        signal.command.trim() !== ''
    );
}

// Generate default name for unnamed raw signals
function generateDefaultRawName(index) {
    return `Unnamed_Raw_${index}`;
}

// Calculate string similarity (used in processing)
function calculateStringSimilarity(str1, str2) {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    const longerLength = longer.length;
    if (longerLength === 0) {
        return 1.0;
    }
    return (longerLength - editDistance(longer, shorter)) / parseFloat(longerLength);
}

function editDistance(s1, s2) {
    s1 = s1.toLowerCase();
    s2 = s2.toLowerCase();
    const costs = [];
    for (let i = 0; i <= s1.length; i++) {
        let lastValue = i;
        for (let j = 0; j <= s2.length; j++) {
            if (i === 0) {
                costs[j] = j;
            } else if (j > 0) {
                let newValue = costs[j - 1];
                if (s1.charAt(i - 1) !== s2.charAt(j - 1)) {
                    newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
                }
                costs[j - 1] = lastValue;
                lastValue = newValue;
            }
        }
        if (i > 0) {
            costs[s2.length] = lastValue;
        }
    }
    return costs[s2.length];
}

// Show notification message
function showNotification(message, type = 'info') {
    elements.notification.classList.remove('success', 'error', 'info');
    elements.notification.classList.add(type);
    elements.notification.textContent = message;
    elements.notification.classList.add('show');
    setTimeout(() => {
        elements.notification.classList.remove('show');
    }, 5000);
}

// Update button text based on the current theme
function updateButtonText(theme) {
    elements.themeToggleButton.textContent = theme === 'dark-mode' ? 'Switch to Light Mode' : 'Switch to Dark Mode';
}

// Reset progress bar and summary
function resetProgress() {
    elements.progressBar.style.width = '0%';
    elements.progressBar.textContent = '0%';
    elements.totalFilesElem.textContent = '0';
    elements.totalSignalsElem.textContent = '0';
    elements.newSignalsElem.textContent = '0';
    elements.duplicateSignalsElem.textContent = '0';
    elements.errorSignalsElem.textContent = '0';
    elements.summary.classList.remove('show');
    const detailedSummaryContainer = document.getElementById('detailed-summary');
    if (detailedSummaryContainer) {
        detailedSummaryContainer.innerHTML = '';
        detailedSummaryContainer.style.display = 'none';
    }
    elements.exportSummaryBtn.disabled = true;
    elements.copySummaryBtn.disabled = true;
}

function resetSummary() {
    elements.totalFilesElem.textContent = '0';
    elements.totalSignalsElem.textContent = '0';
    elements.newSignalsElem.textContent = '0';
    elements.duplicateSignalsElem.textContent = '0';
    elements.errorSignalsElem.textContent = '0';
    elements.summary.classList.remove('show');
    elements.exportSummaryBtn.disabled = true;
    elements.copySummaryBtn.disabled = true;
}

// Update progress bar
function updateProgress(percent) {
    elements.progressBar.style.width = `${percent}%`;
    elements.progressBar.textContent = `${Math.floor(percent)}%`;
}

// Download the updated universal IR file
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

// Convert summary data to CSV format
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

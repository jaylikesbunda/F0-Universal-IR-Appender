// main.js

// =========================
// Main Functions
// =========================

const stats = {
    totalSignals: 0,
    newSignals: 0,
    duplicateSignals: 0,
    errorSignals: 0,
    totalUnnamedRaw: 0,
    totalRenamedButtons: 0,
    processedFilesCount: 0,
    totalButtonCounts: {},
    detailedSummaryData: []
};

// Function to process raw signals
function processRawSignal(signalLines, currentSignal, rawSignalCounter) {
    let rawLines = [];
    for (const line of signalLines) {
        if (line.trim().startsWith('type: raw')) {
            currentSignal.type = 'raw';
        }
        rawLines.push(line);
    }
    
    if (!currentSignal.name) {
        currentSignal.name = generateDefaultRawName(++rawSignalCounter);
        signalLines.unshift(`name: ${currentSignal.name}`);
    }
    
    currentSignal.raw = rawLines.join('\n');
    currentSignal.normalizedRaw = normalizeRawSignal(currentSignal.raw);
    return { currentSignal, rawSignalCounter, signalLines };
}

// Function to toggle raw signal omission
function toggleRawSignalOmission(omit) {
    omitRawSignals = omit;
}

// Function to process a single signal
function processSingleSignal(signalLines, allowedButtonNamesLower, existingSignalsIndex, localSignalsIndex, deviceType, fileStats, matchedButtons) {
    let currentSignal = {};
    let includeSignal = false;
    let isRawSignal = false;
    let originalButtonName = '';

    for (const line of signalLines) {
        if (line.trim().startsWith('name:')) {
            originalButtonName = line.split(':')[1].trim();
            const normalizedName = matchAndRenameButton(originalButtonName, deviceType);
            currentSignal.name = normalizedName;

            if (matchedButtons[normalizedName]) {
                const currentSimilarity = calculateStringSimilarity(originalButtonName, normalizedName);
                if (currentSimilarity > matchedButtons[normalizedName].similarity) {
                    // This match is better, so we'll use this one instead
                    console.log(`Replacing "${matchedButtons[normalizedName].original}" with "${originalButtonName}" for "${normalizedName}"`);
                    matchedButtons[normalizedName] = {
                        original: originalButtonName,
                        similarity: currentSimilarity,
                        signalLines: signalLines.map(l => l.startsWith('name:') ? `name: ${normalizedName}` : l)
                    };
                    includeSignal = allowedButtonNamesLower.has(normalizedName.toLowerCase());
                } else {
                    // The existing match is better, so we'll skip this signal
                    console.log(`Skipping "${originalButtonName}" in favor of existing "${matchedButtons[normalizedName].original}" for "${normalizedName}"`);
                    includeSignal = false;
                }
            } else {
                // This is the first match for this normalized name in this file
                matchedButtons[normalizedName] = {
                    original: originalButtonName,
                    similarity: calculateStringSimilarity(originalButtonName, normalizedName),
                    signalLines: signalLines.map(l => l.startsWith('name:') ? `name: ${normalizedName}` : l)
                };
                includeSignal = allowedButtonNamesLower.has(normalizedName.toLowerCase());
            }

            // Only increment renamedButtonCount if the name was changed and the signal is included
            if (normalizedName !== originalButtonName && includeSignal) {
                fileStats.renamedButtonCount++;
            }
            // Log button renaming and inclusion/exclusion
            console.log(`Button "${originalButtonName}" renamed to "${normalizedName}" - Included: ${includeSignal}`);
        } else if (line.trim().startsWith('type: raw')) {
            isRawSignal = true;
        } else if (!isRawSignal) {
            if (line.trim().startsWith('protocol:')) currentSignal.protocol = line.split(':')[1].trim();
            else if (line.trim().startsWith('address:')) currentSignal.address = line.split(':')[1].trim();
            else if (line.trim().startsWith('command:')) currentSignal.command = line.split(':')[1].trim();
        }
    }

    if (isRawSignal) {
        if (omitRawSignals) {
            return { includeSignal: false, signalLines: '', updatedLocalSignalsIndex: localSignalsIndex };
        }
        const result = processRawSignal(signalLines, currentSignal, fileStats.unnamedRawCount);
        currentSignal = result.currentSignal;
        fileStats.unnamedRawCount = result.rawSignalCounter;
        signalLines = result.signalLines;
    }

    if (includeSignal && isValidSignal(currentSignal)) {
        const key = generateSignalKey(currentSignal);

        // Check against existingSignalsIndex for duplicates in the universal IR file and previous files
        const isDuplicateInExisting = isDuplicateSignal(currentSignal, existingSignalsIndex);
        // Check against localSignalsIndex for duplicates within the same file
        const isDuplicateInLocal = localSignalsIndex.has(key);

        if (!isDuplicateInExisting && !isDuplicateInLocal) {
            // Update localSignalsIndex to keep track within the same file
            localSignalsIndex.set(key, currentSignal);
            fileStats.buttonCounts[currentSignal.name] = (fileStats.buttonCounts[currentSignal.name] || 0) + 1;
            // Increment newSignals only when the signal is actually added
            fileStats.newSignals++;
            return { includeSignal: true, signalLines: signalLines.join('\n'), updatedLocalSignalsIndex: localSignalsIndex };
        } else {
            fileStats.duplicateCount++;
            console.log(`Duplicate signal found for button: ${currentSignal.name}`);
        }
    }

    return { includeSignal: false, signalLines: '', updatedLocalSignalsIndex: localSignalsIndex };
}

// Function to filter IR content
function filterIRContent(content, allowedButtonNames, existingSignalsIndex, fileStats, deviceType) {
    console.log("Filtering content with allowed buttons:", allowedButtonNames);
    const allowedButtonNamesLower = new Set(allowedButtonNames.map(name => name.toLowerCase()));
    const lines = content.split('\n');
    let filteredContent = '';
    let signalLines = [];
    let hasNonRawSignals = false;
    let updatedSignalsIndex = new Map(existingSignalsIndex);

    // Object to store matched buttons and their similarities
    let matchedButtons = {};
    let localSignalsIndex = new Map(); // Create a local index for the current file

    for (let i = 0; i <= lines.length; i++) {
        let line = (i < lines.length) ? lines[i] : '#';
        if (line.trim().startsWith('#') || line.trim() === '' || i === lines.length) {
            if (signalLines.length > 0) {
                const result = processSingleSignal(signalLines, allowedButtonNamesLower, existingSignalsIndex, localSignalsIndex, deviceType, fileStats, matchedButtons);
                localSignalsIndex = result.updatedLocalSignalsIndex;
                signalLines = [];
            }
        } else {
            signalLines.push(line);
        }
    }

    // Process the matched buttons
    for (const [normalizedName, buttonData] of Object.entries(matchedButtons)) {
        if (allowedButtonNamesLower.has(normalizedName.toLowerCase())) {
            filteredContent += buttonData.signalLines.join('\n') + '\n#\n';
            if (!buttonData.signalLines.join('\n').includes('type: raw')) {
                hasNonRawSignals = true;
            }
        }
    }

    // If omitting raw signals and there are no non-raw signals, return empty content
    if (omitRawSignals && !hasNonRawSignals) {
        return { filteredContent: '', updatedSignalsIndex };
    }

    // After processing the file, update existingSignalsIndex with new signals
    for (const [key, signal] of localSignalsIndex.entries()) {
        updatedSignalsIndex.set(key, signal);
    }

    return { filteredContent: filteredContent.trim(), updatedSignalsIndex };
}

// Function to parse IR file signals
function parseIRFileSignals(content, allowedButtonNames, deviceType) {
    const allowedButtonNamesLower = new Set(allowedButtonNames.map(name => name.toLowerCase()));
    const lines = content.split('\n');
    let signals = [];
    let signalLines = [];
    let matchedButtons = {};
    let localSignalsIndex = new Map(); // Define localSignalsIndex

    for (let i = 0; i <= lines.length; i++) {
        let line = (i < lines.length) ? lines[i].trim() : '#';
        if (line.startsWith('#') || line === '') {
            if (signalLines.length > 0) {
                const result = processSingleSignal(
                    signalLines,
                    allowedButtonNamesLower,
                    new Map(),
                    localSignalsIndex,
                    deviceType, // Pass deviceType here
                    { buttonCounts: {}, unnamedRawCount: 0, renamedButtonCount: 0 },
                    matchedButtons
                );
                if (result.includeSignal) {
                    signals.push(parseSignalFromLines(result.signalLines.split('\n')));
                }
                signalLines = [];
            }
        } else {
            signalLines.push(line);
        }
    }

    return signals;
}

// Helper function to parse a signal from lines
function parseSignalFromLines(lines) {
    let signal = {};
    for (const line of lines) {
        if (line.startsWith('name:')) signal.name = line.split(':')[1].trim();
        else if (line.startsWith('protocol:')) signal.protocol = line.split(':')[1].trim();
        else if (line.startsWith('address:')) signal.address = line.split(':')[1].trim();
        else if (line.startsWith('command:')) signal.command = line.split(':')[1].trim();
        else if (line.startsWith('type: raw')) signal.type = 'raw';
    }
    return signal;
}

// Main function to process files
async function processFiles(irFiles) {
    if (irFiles.length === 0) {
        showNotification('No .ir files selected. Please choose a folder containing .ir files.', 'error');
        return;
    }

    const { deviceType, deviceTypeFileName } = getDeviceTypeInfo();
    const allowedButtonNames = getAllowedButtonNames(deviceType);

    initializeProcessing();

    // Reset stats object
    resetStats(stats);

    try {
        let universalIRContent;
        const selectedOption = document.querySelector('input[name="universal-file-option"]:checked').value;

        if (selectedOption === 'fetch') {
            universalIRContent = await fetchAndPrepareUniversalIRContent(deviceTypeFileName);
        } else {
            if (!elements.manualUniversalFile.files[0]) {
                throw new Error('No universal file uploaded. Please upload a file.');
            }
            showNotification('Reading uploaded universal IR file...', 'info');
            universalIRContent = await readFileContent(elements.manualUniversalFile.files[0]);
            showNotification('Universal IR file successfully loaded.', 'success');
        }

        let existingSignalsIndex = parseUniversalIRFile(universalIRContent);
        const processedFiles = new Set();
        let updatedUniversalIRContent = universalIRContent;

        for (let i = 0; i < irFiles.length; i++) {
            const file = irFiles[i];
            if (isFileDuplicate(file, processedFiles)) continue;

            stats.processedFilesCount++;
            const fileStats = await processIndividualFile(file, allowedButtonNames, existingSignalsIndex, deviceType);

            updateStats(stats, file, fileStats);

            if (fileStats.filteredContent) {
                updatedUniversalIRContent = appendToUniversalIRContent(updatedUniversalIRContent, fileStats.filteredContent, fileStats.deviceInfo);
            }

            // Update existingSignalsIndex with signals from the current file
            existingSignalsIndex = new Map([...existingSignalsIndex, ...fileStats.updatedSignalsIndex]);

            updateProgress(((i + 1) / irFiles.length) * 100);
        }

        updateSummaryDisplay(stats);
        finishProcessing(updatedUniversalIRContent, deviceType);
    } catch (error) {
        handleProcessingError(error);
    } finally {
        cleanupProcessing();
    }
}

// Function to reset stats
function resetStats(stats) {
    stats.totalSignals = 0;
    stats.newSignals = 0;
    stats.duplicateSignals = 0;
    stats.errorSignals = 0;
    stats.totalUnnamedRaw = 0;
    stats.totalRenamedButtons = 0;
    stats.processedFilesCount = 0;
    stats.totalButtonCounts = {};
    stats.detailedSummaryData = [];
}

// Function to get device type information
function getDeviceTypeInfo() {
    const deviceTypeName = elements.deviceTypeSelect.options[elements.deviceTypeSelect.selectedIndex].text;
    const deviceTypeFileName = elements.deviceTypeSelect.value;
    const deviceType = deviceTypeName.toLowerCase();
    console.log("Selected device type:", deviceType);
    console.log("Selected file name:", deviceTypeFileName);
    return { deviceType, deviceTypeFileName };
}

// Function to get allowed button names based on device type
function getAllowedButtonNames(deviceType) {
    const allowedButtonNames = allowedButtons[deviceType] || [];
    console.log("Allowed buttons:", allowedButtonNames);
    return allowedButtonNames;
}

// Function to initialize processing UI
function initializeProcessing() {
    elements.processButton.disabled = true;
    resetProgress();
    elements.progressContainer.style.display = 'block';
    elements.summary.classList.remove('show');
}

// Function to initialize stats (not used currently, but kept for potential future use)
function initializeStats() {
    return {
        totalSignals: 0,
        newSignals: 0,
        duplicateSignals: 0,
        errorSignals: 0,
        totalUnnamedRaw: 0,
        totalRenamedButtons: 0,
        processedFilesCount: 0,
        totalButtonCounts: {}
    };
}

// Function to fetch and prepare universal IR content
async function fetchAndPrepareUniversalIRContent(deviceTypeFileName) {
    const selectedOption = document.querySelector('input[name="universal-file-option"]:checked').value;
    let content;

    if (selectedOption === 'fetch') {
        showNotification('Fetching latest universal IR file...', 'info');
        content = await fetchUniversalIRFile(deviceTypeFileName);
        showNotification('Universal IR file successfully loaded.', 'success');
    } else {
        if (!elements.manualUniversalFile.files[0]) {
            throw new Error('No universal file uploaded. Please upload a file.');
        }
        showNotification('Reading uploaded universal IR file...', 'info');
        content = await readFileContent(elements.manualUniversalFile.files[0]);
        showNotification('Universal IR file successfully loaded.', 'success');
    }
    
    content = content.trim();
    while (content.endsWith('#') || content.endsWith('\n')) {
        content = content.slice(0, -1).trimEnd();
    }
    return content + '\n#';
}

// Function to check if a file is a duplicate
function isFileDuplicate(file, processedFiles) {
    const fileIdentifier = `${file.name}-${file.size}`;
    if (processedFiles.has(fileIdentifier)) {
        console.warn(`File "${file.name}" has already been processed. Skipping.`);
        return true;
    }
    processedFiles.add(fileIdentifier);
    return false;
}

// Function to process an individual file
async function processIndividualFile(file, allowedButtonNames, existingSignalsIndex, deviceType) {
    const fileStats = { 
        duplicateCount: 0, 
        buttonCounts: {}, 
        unnamedRawCount: 0, 
        renamedButtonCount: 0,
        newSignals: 0, 
        errorSignals: 0, 
        errorMessages: [] 
    };
    let fileErrorSignals = 0;
    let fileErrorMessages = [];

    try {
        const content = await readFileContent(file);
        const deviceInfo = extractDeviceInfo(content, file.name);
        const { filteredContent, updatedSignalsIndex } = filterIRContent(content, allowedButtonNames, existingSignalsIndex, fileStats, deviceType);

        if (filteredContent) {
            const signals = parseIRFileSignals(filteredContent, allowedButtonNames, deviceType);
            // No need to set fileNewSignals here as it's already incremented in processSingleSignal
        }

        return { 
            ...fileStats, 
            deviceInfo, 
            filteredContent, 
            updatedSignalsIndex 
        };
    } catch (fileError) {
        console.error(`Error processing file "${file.name}":`, fileError);
        fileErrorMessages.push(fileError.message);
        fileErrorSignals++;
        return { 
            ...fileStats, 
            errorSignals: fileErrorSignals, 
            errorMessages: fileErrorMessages, 
            updatedSignalsIndex: existingSignalsIndex 
        };
    }
}

// Function to update global stats with file stats
function updateStats(globalStats, file, fileStats) {
    // Increment global newSignals by the number of new signals added from this file
    globalStats.newSignals += fileStats.newSignals;

    // Increment global duplicateSignals by the number of duplicates found in this file
    globalStats.duplicateSignals += fileStats.duplicateCount;

    // Increment global totalUnnamedRaw by the number of unnamed raw signals added from this file
    globalStats.totalUnnamedRaw += fileStats.unnamedRawCount;

    // Increment global totalRenamedButtons by the number of renamed buttons in this file
    globalStats.totalRenamedButtons += fileStats.renamedButtonCount;

    // Increment global errorSignals by the number of errors in this file
    globalStats.errorSignals += fileStats.errorSignals || 0;

    // Update global buttonCounts with counts from this file
    for (const [button, count] of Object.entries(fileStats.buttonCounts)) {
        globalStats.totalButtonCounts[button] = (globalStats.totalButtonCounts[button] || 0) + count;
    }

    // Add detailed summary entry for this file
    globalStats.detailedSummaryData.push(createDetailedSummaryEntry(file, fileStats));
}

// Function to create a detailed summary entry for a file
function createDetailedSummaryEntry(file, fileStats) {
    return {
        fileName: file.name,
        newSignals: fileStats.newSignals,
        duplicateSignals: fileStats.duplicateCount,
        errorSignals: fileStats.errorSignals || 0,
        errorMessages: fileStats.errorMessages || [],
        buttonCounts: fileStats.buttonCounts,
        unnamedRawCount: fileStats.unnamedRawCount,
        renamedButtonCount: fileStats.renamedButtonCount
    };
}

// Function to append filtered content to the universal IR content
function appendToUniversalIRContent(universalIRContent, filteredContent, deviceInfo) {
    const commentLine = `# Model: ${deviceInfo}\n#\n`;
    return universalIRContent + `${commentLine}${filteredContent.trim()}\n`;
}

// Function to update the summary display in the UI
function updateSummaryDisplay(stats) {
    const totalSignals = stats.newSignals + stats.duplicateSignals;
    elements.totalFilesElem.textContent = stats.processedFilesCount.toString();
    elements.totalSignalsElem.textContent = totalSignals.toString();
    elements.newSignalsElem.textContent = stats.newSignals.toString();
    elements.duplicateSignalsElem.textContent = stats.duplicateSignals.toString();
    elements.errorSignalsElem.textContent = stats.errorSignals.toString();

    const unnamedRawElem = document.getElementById('unnamed-raw');
    if (unnamedRawElem) {
        unnamedRawElem.textContent = stats.totalUnnamedRaw.toString();
    }

    const renamedButtonsElem = document.getElementById('renamed-buttons');
    if (renamedButtonsElem) {
        renamedButtonsElem.textContent = stats.totalRenamedButtons.toString();
    }

    populateDetailedSummary(stats.detailedSummaryData);
    updateButtonSummary(stats.totalButtonCounts, stats.totalUnnamedRaw, stats.totalRenamedButtons);
    elements.summary.classList.add('show');
    elements.exportSummaryBtn.disabled = false;
    elements.copySummaryBtn.disabled = false;
}

// Function to finalize processing
function finishProcessing(universalIRContent, deviceType) {
    showNotification('IR files have been successfully appended to the universal IR file.', 'success');
    const selectedRepo = elements.repoSelect.value;
    const downloadFileName = `${selectedRepo.toLowerCase()}-universal-ir-${deviceType.replace(/\s+/g, '-')}.ir`;
    downloadFile(universalIRContent, downloadFileName);

    // Enable export and copy buttons
    elements.exportSummaryBtn.addEventListener('click', () => exportSummary(stats));
    elements.copySummaryBtn.addEventListener('click', () => copySummaryToClipboard(stats));
}

// Function to handle processing errors
function handleProcessingError(error) {
    console.error('Error during processing:', error);
    showNotification(error.message, 'error');
}

// Function to clean up processing UI
function cleanupProcessing() {
    elements.processButton.disabled = false;
    elements.progressContainer.style.display = 'none';
}

// Function to update allowed buttons based on repository and device type
async function updateAllowedButtons() {
    const selectedRepo = elements.repoSelect.value;
    const repoInfo = REPOSITORIES[selectedRepo];
    const files = await getIRAssetFiles(repoInfo);

    const defaultButtons = ['Power', 'Vol_up', 'Vol_dn', 'Mute'];

    files.forEach(file => {
        const deviceType = file.name.replace('.ir', '').replace(/_/g, ' ').toLowerCase();

        if (!allowedButtons[deviceType]) {
            const existingType = Object.keys(allowedButtons).find(
                key => key.toLowerCase() === deviceType.toLowerCase()
            );

            if (existingType) {
                allowedButtons[deviceType] = [...allowedButtons[existingType]];
            } else {
                allowedButtons[deviceType] = [...defaultButtons];
            }
        }
    });

    // Special cases with lowercase keys
    if (allowedButtons['tv'] && !allowedButtons['tv'].includes('Ch_next')) {
        allowedButtons['tv'].push('Ch_next', 'Ch_prev');
    }
    if (allowedButtons['audio'] && !allowedButtons['audio'].includes('Next')) {
        allowedButtons['audio'].push('Next', 'Prev', 'Play', 'Pause');
    }
    if (allowedButtons['ac'] && !allowedButtons['ac'].includes('Cool_hi')) {
        allowedButtons['ac'] = ['Off', 'Cool_hi', 'Cool_lo', 'Heat_hi', 'Heat_lo', 'Dh'];
    }

    console.log("Updated allowed buttons:", allowedButtons);
}

// Function to update device type options in the UI
async function updateDeviceTypeOptions() {
    const selectedRepo = elements.repoSelect.value;
    const repoInfo = REPOSITORIES[selectedRepo];
    const files = await getIRAssetFiles(repoInfo);
   
    elements.deviceTypeSelect.innerHTML = '';
    files.forEach(file => {
        const option = document.createElement('option');
        option.value = file.name; // e.g., 'ac.ir'
        option.textContent = file.name.replace('.ir', '').toLowerCase(); // e.g., 'ac'
        elements.deviceTypeSelect.appendChild(option);
    });
   
    // Add Blu-ray/DVD option if it's not already present
    if (!Array.from(elements.deviceTypeSelect.options).some(option => option.value === 'bluray_dvd.ir')) {
        const blurayOption = document.createElement('option');
        blurayOption.value = 'bluray_dvd.ir';
        blurayOption.textContent = 'bluray_dvd';
        elements.deviceTypeSelect.appendChild(blurayOption);
    }
   
    // Update allowed buttons after updating device types
    await updateAllowedButtons();
}

// Function to update the button summary in the UI
function updateButtonSummary(buttonCounts, unnamedRawCount, renamedButtonCount) {
    elements.buttonSummaryElem.innerHTML = '';
    const sortedButtons = Object.entries(buttonCounts).sort((a, b) => a[0].localeCompare(b[0]));
    for (const [button, count] of sortedButtons) {
        const buttonElem = document.createElement('div');
        buttonElem.textContent = `${button}: ${count}`;
        elements.buttonSummaryElem.appendChild(buttonElem);
    }
    if (unnamedRawCount > 0) {
        const unnamedRawElem = document.createElement('div');
        unnamedRawElem.textContent = `Unnamed Raw Signals: ${unnamedRawCount}`;
        unnamedRawElem.style.color = 'orange';  // Highlight this information
        elements.buttonSummaryElem.appendChild(unnamedRawElem);
    }
    if (renamedButtonCount > 0) {
        const renamedButtonsElem = document.createElement('div');
        renamedButtonsElem.textContent = `Renamed Buttons: ${renamedButtonCount}`;
        renamedButtonsElem.style.color = 'green';  // Highlight this information
        elements.buttonSummaryElem.appendChild(renamedButtonsElem);
    }
    if (sortedButtons.length === 0 && unnamedRawCount === 0 && renamedButtonCount === 0) {
        const noButtonsElem = document.createElement('p');
        noButtonsElem.textContent = 'No supported universal buttons were added.';
        elements.buttonSummaryElem.appendChild(noButtonsElem);
    }
}

// Function to populate the detailed summary in the UI
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

// Function to export processing summary
function exportSummary() {
    const summaryData = {
        totalFiles: elements.totalFilesElem.textContent,
        totalSignals: elements.totalSignalsElem.textContent,
        newSignals: elements.newSignalsElem.textContent,
        duplicateSignals: elements.duplicateSignalsElem.textContent,
        errorSignals: elements.errorSignalsElem.textContent,
        buttonCounts: {},
        detailedSummary: []
    };

    // Populate button counts
    const buttonSummaryElems = document.querySelectorAll('#button-summary div');
    buttonSummaryElems.forEach(elem => {
        const [button, count] = elem.textContent.split(':');
        summaryData.buttonCounts[button.trim()] = parseInt(count.trim());
    });

    // Populate detailed summary
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

// Function to copy summary to clipboard
function copySummaryToClipboard() {
    let summaryText = `Processing Summary:\n`;
    summaryText += `Total Files Processed: ${elements.totalFilesElem.textContent}\n`;
    summaryText += `Total Signals: ${elements.totalSignalsElem.textContent}\n`;
    summaryText += `New Signals: ${elements.newSignalsElem.textContent}\n`;
    summaryText += `Duplicate Signals: ${elements.duplicateSignalsElem.textContent}\n`;
    summaryText += `Errors: ${elements.errorSignalsElem.textContent}\n\n`;

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

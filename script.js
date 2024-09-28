const elements = {
    fileInput: document.getElementById('file-input'),
    repoSelect: document.getElementById('repo-select'), // New element for repository selection
    deviceTypeSelect: document.getElementById('device-type'),
    processButton: document.getElementById('process-btn'),
    themeToggleButton: document.getElementById('theme-toggle-button'),
    body: document.body,
    progressContainer: document.getElementById('progress-container'),
    progressBar: document.getElementById('progress-bar'),
    summary: document.getElementById('summary'),
    totalFilesElem: document.getElementById('total-files'),
    totalSignalsElem: document.getElementById('total-signals'),
    newSignalsElem: document.getElementById('new-signals'),
    duplicateSignalsElem: document.getElementById('duplicate-signals'),
    errorSignalsElem: document.getElementById('error-signals'),
    notification: document.getElementById('notification'),
    exportSummaryBtn: document.getElementById('export-summary-btn'),
    copySummaryBtn: document.getElementById('copy-summary-btn'),
    fileCountElem: document.getElementById('file-count'),
    browserWarningElem: document.getElementById('browser-warning'),
    buttonSummaryElem: document.getElementById('button-summary')
};
// Updated allowedButtons object
let allowedButtons = {
    'TV': ['Power', 'Vol_up', 'Vol_dn', 'Ch_next', 'Ch_prev', 'Mute'],
    'Audio Player': ['Power', 'Vol_up', 'Vol_dn', 'Next', 'Prev', 'Mute', 'Play', 'Pause'],
    'Projector': ['Power', 'Vol_up', 'Vol_dn', 'Mute'],
    'Air Conditioner': ['Off', 'Cool_hi', 'Cool_lo', 'Heat_hi', 'Heat_lo', 'Dh']
};

const buttonNameMapping = {
    "TV": {
        // Power
        "power": "Power",
        "pwr": "Power",
        "pw": "Power",
        "p": "Power",
        "on(?:_)?off": "Power",
        "on/off": "Power",
        "standby": "Power",
        "stby": "Power",
        "switch": "Power",
        "sw": "Power",
        "toggle": "Power",
        "tgl": "Power",
        "powr": "Power",
        "power_on": "Power",
        "power_off": "Power",

        // Volume Up
        "vol(?:_)?up": "Vol_up",
        "v(?:_)?up": "Vol_up",
        "v(?:_)?\\+": "Vol_up",
        "vu": "Vol_up",
        "volume(?:_)?up": "Vol_up",
        "vol(?:_)?increase": "Vol_up",
        "vol(?:_)?inc": "Vol_up",
        "vol(?:_)?\\+": "Vol_up",
        "v\\+": "Vol_up",
        "louder": "Vol_up",
        "volume(?:_)?raise": "Vol_up",
        "audio(?:_)?up": "Vol_up",
        "au(?:_)?up": "Vol_up",
        "vol_plus": "Vol_up",
        "volume_plus": "Vol_up",

        // Volume Down
        "vol(?:_)?down": "Vol_dn",
        "vol(?:_)?dn": "Vol_dn",
        "v(?:_)?down": "Vol_dn",
        "v(?:_)?dn": "Vol_dn",
        "v(?:_)?\\-": "Vol_dn",
        "vd": "Vol_dn",
        "volume(?:_)?down": "Vol_dn",
        "vol(?:_)?decrease": "Vol_dn",
        "vol(?:_)?dec": "Vol_dn",
        "vol(?:_)?dwn": "Vol_dn",
        "vol(?:_)?\\-": "Vol_dn",
        "v\\-": "Vol_dn",
        "softer": "Vol_dn",
        "volume(?:_)?lower": "Vol_dn",
        "audio(?:_)?down": "Vol_dn",
        "au(?:_)?dn": "Vol_dn",
        "vol_minus": "Vol_dn",
        "volume_minus": "Vol_dn",

        // Channel Next
        "ch(?:_)?up": "Ch_next",
        "ch(?:_)?\\+": "Ch_next",
        "c(?:_)?up": "Ch_next",
        "c\\+": "Ch_next",
        "cu": "Ch_next",
        "channel(?:_)?up": "Ch_next",
        "ch(?:_)?next": "Ch_next",
        "next(?:_)?channel": "Ch_next",
        "channel(?:_)?forward": "Ch_next",
        "ch(?:_)?fwd": "Ch_next",
        "prog(?:_)?up": "Ch_next",
        "program(?:_)?up": "Ch_next",
        "p(?:_)?up": "Ch_next",
        "pu": "Ch_next",
        "channel_plus": "Ch_next",

        // Channel Previous
        "ch(?:_)?down": "Ch_prev",
        "ch(?:_)?dn": "Ch_prev",
        "ch(?:_)?\\-": "Ch_prev",
        "c(?:_)?down": "Ch_prev",
        "c(?:_)?dn": "Ch_prev",
        "c\\-": "Ch_prev",
        "cd": "Ch_prev",
        "channel(?:_)?down": "Ch_prev",
        "ch(?:_)?prev": "Ch_prev",
        "previous(?:_)?channel": "Ch_prev",
        "channel(?:_)?back": "Ch_prev",
        "ch(?:_)?bk": "Ch_prev",
        "prog(?:_)?down": "Ch_prev",
        "program(?:_)?down": "Ch_prev",
        "p(?:_)?down": "Ch_prev",
        "p(?:_)?dn": "Ch_prev",
        "pd": "Ch_prev",
        "channel_minus": "Ch_prev",

        // Mute
        "mute": "Mute",
        "mu": "Mute",
        "mt": "Mute",
        "silence": "Mute",
        "sil": "Mute",
        "quiet": "Mute",
        "qt": "Mute",
        "audio(?:_)?off": "Mute",
        "sound(?:_)?off": "Mute",
        "no(?:_)?sound": "Mute",
        "mte": "Mute",
        "mute_toggle": "Mute"
    },
    "Audio": {
        // Power
        "power": "Power",
        "pwr": "Power",
        "pw": "Power",
        "p": "Power",
        "on(?:_)?off": "Power",
        "on/off": "Power",
        "standby": "Power",
        "stby": "Power",
        "switch": "Power",
        "sw": "Power",
        "toggle": "Power",
        "tgl": "Power",
        "powr": "Power",
        "power_on": "Power",
        "power_off": "Power",

        // Volume Up
        "vol(?:_)?up": "Vol_up",
        "v(?:_)?up": "Vol_up",
        "v(?:_)?\\+": "Vol_up",
        "vu": "Vol_up",
        "volume(?:_)?up": "Vol_up",
        "vol(?:_)?increase": "Vol_up",
        "vol(?:_)?inc": "Vol_up",
        "vol(?:_)?\\+": "Vol_up",
        "v\\+": "Vol_up",
        "louder": "Vol_up",
        "volume(?:_)?raise": "Vol_up",
        "audio(?:_)?up": "Vol_up",
        "au(?:_)?up": "Vol_up",
        "vol_plus": "Vol_up",
        "volume_plus": "Vol_up",

        // Volume Down
        "vol(?:_)?down": "Vol_dn",
        "vol(?:_)?dn": "Vol_dn",
        "v(?:_)?down": "Vol_dn",
        "v(?:_)?dn": "Vol_dn",
        "v(?:_)?\\-": "Vol_dn",
        "vd": "Vol_dn",
        "volume(?:_)?down": "Vol_dn",
        "vol(?:_)?decrease": "Vol_dn",
        "vol(?:_)?dec": "Vol_dn",
        "vol(?:_)?dwn": "Vol_dn",
        "vol(?:_)?\\-": "Vol_dn",
        "v\\-": "Vol_dn",
        "softer": "Vol_dn",
        "volume(?:_)?lower": "Vol_dn",
        "audio(?:_)?down": "Vol_dn",
        "au(?:_)?dn": "Vol_dn",
        "vol_minus": "Vol_dn",
        "volume_minus": "Vol_dn",

        // Next
        "next": "Next",
        "nxt": "Next",
        "nx": "Next",
        "n": "Next",
        "skip(?:_)?fwd": "Next",
        "sk(?:_)?f": "Next",
        "forward": "Next",
        "fwd": "Next",
        "ff": "Next",
        "fast(?:_)?forward": "Next",
        "track(?:_)?forward": "Next",
        "tr(?:_)?fwd": "Next",
        "next(?:_)?track": "Next",
        "skip(?:_)?ahead": "Next",
        "track_next": "Next",

        // Previous
        "prev(?:ious)?": "Prev",
        "prv": "Prev",
        "pr": "Prev",
        "skip(?:_)?back": "Prev",
        "sk(?:_)?b": "Prev",
        "rewind": "Prev",
        "rew": "Prev",
        "rw": "Prev",
        "back": "Prev",
        "bk": "Prev",
        "track(?:_)?back": "Prev",
        "tr(?:_)?bk": "Prev",
        "previous(?:_)?track": "Prev",
        "skip(?:_)?previous": "Prev",
        "track_prev": "Prev",

        // Play
        "play": "Play",
        "pl": "Play",
        "ply": "Play",
        "start": "Play",
        "strt": "Play",
        "resume": "Play",
        "rsm": "Play",
        "begin": "Play",
        "bgn": "Play",
        "playback": "Play",
        "pb": "Play",

        // Pause
        "pause": "Pause",
        "pse": "Pause",
        "ps": "Pause",
        "hold": "Pause",
        "hld": "Pause",
        "stop": "Pause",
        "stp": "Pause",
        "freeze": "Pause",
        "frz": "Pause",
        "suspend": "Pause",
        "spnd": "Pause",
        "break": "Pause",
        "brk": "Pause",

        // Mute
        "mute": "Mute",
        "mu": "Mute",
        "mt": "Mute",
        "silence": "Mute",
        "sil": "Mute",
        "quiet": "Mute",
        "qt": "Mute",
        "audio(?:_)?off": "Mute",
        "sound(?:_)?off": "Mute",
        "no(?:_)?sound": "Mute",
        "mte": "Mute",
        "mute_toggle": "Mute"
    },
    "AC": {
        // Off
        "off": "Off",
        "of": "Off",
        "power": "Off",
        "shutdown": "Off",
        "shtdwn": "Off",
        "shut(?:_)?down": "Off",
        "power(?:_)?off": "Off",
        "pwr(?:_)?off": "Off",
        "pw(?:_)?off": "Off",
        "p(?:_)?off": "Off",
        "turn(?:_)?off": "Off",
        "switch(?:_)?off": "Off",
        "sw(?:_)?off": "Off",

        // Dehumidify
        "dh": "Dh",
        "dehumidify": "Dh",
        "dehum": "Dh",
        "dhum": "Dh",
        "dry": "Dh",
        "dehumid": "Dh",
        "moisture(?:_)?remove": "Dh",
        "mst(?:_)?rmv": "Dh",
        "humidity(?:_)?control": "Dh",
        "hum(?:_)?ctrl": "Dh",
        "water(?:_)?remove": "Dh",
        "wtr(?:_)?rmv": "Dh",

        // Cool High
        "cool(?:_)?hi": "Cool_hi",
        "ch": "Cool_hi",
        "cool(?:_)?high": "Cool_hi",
        "high(?:_)?cool": "Cool_hi",
        "hi(?:_)?cool": "Cool_hi",
        "max(?:_)?cool": "Cool_hi",
        "cool(?:_)?max": "Cool_hi",
        "strong(?:_)?cool": "Cool_hi",
        "str(?:_)?cool": "Cool_hi",

        // Cool Low
        "cool(?:_)?lo": "Cool_lo",
        "cl": "Cool_lo",
        "cool(?:_)?low": "Cool_lo",
        "low(?:_)?cool": "Cool_lo",
        "min(?:_)?cool": "Cool_lo",
        "cool(?:_)?min": "Cool_lo",
        "gentle(?:_)?cool": "Cool_lo",
        "gnt(?:_)?cool": "Cool_lo",

        // Heat High
        "heat(?:_)?hi": "Heat_hi",
        "hh": "Heat_hi",
        "heat(?:_)?high": "Heat_hi",
        "high(?:_)?heat": "Heat_hi",
        "hi(?:_)?heat": "Heat_hi",
        "max(?:_)?heat": "Heat_hi",
        "heat(?:_)?max": "Heat_hi",
        "strong(?:_)?heat": "Heat_hi",
        "str(?:_)?heat": "Heat_hi",

        // Heat Low
        "heat(?:_)?lo": "Heat_lo",
        "hl": "Heat_lo",
        "heat(?:_)?low": "Heat_lo",
        "low(?:_)?heat": "Heat_lo",
        "min(?:_)?heat": "Heat_lo",
        "heat(?:_)?min": "Heat_lo",
        "gentle(?:_)?heat": "Heat_lo",
        "gnt(?:_)?heat": "Heat_lo"
    }
};

function matchAndRenameButton(buttonName, deviceType) {
    const normalizedButton = normalizeButtonName(buttonName);
    const mappings = buttonNameMapping[deviceType] || {};
    
    for (const [pattern, standardName] of Object.entries(mappings)) {
        const regex = new RegExp(`^${pattern}$`, 'i');
        if (regex.test(normalizedButton)) {
            return standardName;
        }
    }
    
    // If no match found, return the normalized button name
    return normalizedButton;
}

const REPOSITORIES = {
    'Next-Flip': {
        owner: 'Next-Flip',
        repo: 'Momentum-Firmware',
        branch: 'dev'
    },
    'DarkFlippers': {
        owner: 'DarkFlippers',
        repo: 'unleashed-firmware',
        branch: 'dev'
    },
    'Flipper Devices': {
        owner: 'flipperdevices',
        repo: 'flipperzero-firmware',
        branch: 'dev'
    }
};

// GitHub API constants
const GITHUB_API_BASE = 'https://api.github.com/repos/flipperdevices/flipperzero-firmware';
const IR_ASSETS_PATH = 'applications/main/infrared/resources/infrared/assets';
const BRANCH = 'dev';

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Theme toggle
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        elements.body.classList.remove('light-mode', 'dark-mode');
        elements.body.classList.add(savedTheme);
        updateButtonText(savedTheme);
    }

    elements.themeToggleButton.addEventListener('click', () => {
        const currentTheme = elements.body.classList.contains('light-mode') ? 'light-mode' : 'dark-mode';
        const newTheme = currentTheme === 'light-mode' ? 'dark-mode' : 'light-mode';
        elements.body.classList.remove(currentTheme);
        elements.body.classList.add(newTheme);
        localStorage.setItem('theme', newTheme);
        updateButtonText(newTheme);
    });

    // Check for 'webkitdirectory' support
    const supportsWebkitDirectory = 'webkitdirectory' in document.createElement('input');
    if (!supportsWebkitDirectory) {
        elements.browserWarningElem.style.display = 'block';
    }

    // Update file input label and display file count
    elements.fileInput.addEventListener('change', (event) => {
        const files = event.target.files;
        const irFiles = Array.from(files).filter(file => file.name.toLowerCase().endsWith('.ir'));
        const fileCount = irFiles.length;
        elements.fileCountElem.textContent = `${fileCount} .ir file${fileCount !== 1 ? 's' : ''} selected`;
        elements.totalFilesElem.textContent = fileCount;
        resetSummary();
    });

    // Process files
    elements.processButton.addEventListener('click', () => {
        const files = Array.from(elements.fileInput.files).filter(file => file.name.toLowerCase().endsWith('.ir'));
        processFiles(files);
    });

    elements.repoSelect.addEventListener('change', async () => {
        await updateDeviceTypeOptions();
    });
    
    // Export summary
    elements.exportSummaryBtn.addEventListener('click', exportSummary);

    // Copy summary
    elements.copySummaryBtn.addEventListener('click', copySummaryToClipboard);

    // Populate repository select
    populateRepoSelect();

    // Update device type options when repository changes
    elements.repoSelect.addEventListener('change', updateDeviceTypeOptions);

    // Initial population of device type options
    updateDeviceTypeOptions();
});


// Update button text based on the current theme
function updateButtonText(theme) {
    elements.themeToggleButton.textContent = theme === 'dark-mode' ? 'Switch to Light Mode' : 'Switch to Dark Mode';
}

function showNotification(message, type = 'info') {
    elements.notification.classList.remove('success', 'error', 'info');
    elements.notification.classList.add(type);
    elements.notification.textContent = message;
    elements.notification.classList.add('show');
    setTimeout(() => {
        elements.notification.classList.remove('show');
    }, 5000);
}

function populateRepoSelect() {
    elements.repoSelect.innerHTML = '';
    Object.keys(REPOSITORIES).forEach(repoName => {
        const option = document.createElement('option');
        option.value = repoName;
        option.textContent = repoName;
        elements.repoSelect.appendChild(option);
    });
}

async function updateAllowedButtons() {
    const selectedRepo = elements.repoSelect.value;
    const repoInfo = REPOSITORIES[selectedRepo];
    const files = await getIRAssetFiles(repoInfo);
    
    const defaultButtons = ['Power', 'Vol_up', 'Vol_down', 'Mute'];
    
    files.forEach(file => {
        const deviceType = file.name.replace('.ir', '').replace(/_/g, ' ');
        const normalizedDeviceType = deviceType.toLowerCase();
        
        if (!allowedButtons[normalizedDeviceType]) {
            // Check if there's a matching device type with different casing
            const existingType = Object.keys(allowedButtons).find(
                key => key.toLowerCase() === normalizedDeviceType
            );
            
            if (existingType) {
                // Use the existing buttons for this device type
                allowedButtons[normalizedDeviceType] = [...allowedButtons[existingType]];
            } else {
                // Set default buttons for new device types
                allowedButtons[normalizedDeviceType] = [...defaultButtons];
            }
        }
    });
    
    // Special cases for specific device types
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


// Updated updateDeviceTypeOptions function
async function updateDeviceTypeOptions() {
    const selectedRepo = elements.repoSelect.value;
    const repoInfo = REPOSITORIES[selectedRepo];
    const files = await getIRAssetFiles(repoInfo);
    
    elements.deviceTypeSelect.innerHTML = '';
    files.forEach(file => {
        const option = document.createElement('option');
        option.value = file.name;
        option.textContent = file.name.replace('.ir', '').replace(/_/g, ' ');
        elements.deviceTypeSelect.appendChild(option);
    });
    
    console.log("Available device types:", files.map(f => f.name));
    
    // Update allowed buttons after updating device types
    await updateAllowedButtons();
}


// GitHub API Functions
async function fetchUniversalIRFile(deviceTypeFileName) {
    const selectedRepo = elements.repoSelect.value;
    const repoInfo = REPOSITORIES[selectedRepo];
    const url = `https://api.github.com/repos/${repoInfo.owner}/${repoInfo.repo}/contents/${IR_ASSETS_PATH}/${deviceTypeFileName}?ref=${repoInfo.branch}`;
    
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

async function getIRAssetFiles(repoInfo) {
    const url = `https://api.github.com/repos/${repoInfo.owner}/${repoInfo.repo}/contents/${IR_ASSETS_PATH}?ref=${repoInfo.branch}`;
    
    try {
        const response = await fetch(url, {
            headers: {
                'Accept': 'application/vnd.github.v3+json',
                'User-Agent': 'UniversalIRAppender/1.0'
            }
        });
        if (!response.ok) {
            throw new Error(`GitHub API request failed: ${response.statusText}`);
        }
        const files = await response.json();
        return files.filter(file => file.name.endsWith('.ir'));
    } catch (error) {
        console.error('Error fetching IR asset files from GitHub:', error);
        throw error;
    }
}


async function processFiles(irFiles) {
    if (irFiles.length === 0) {
        showNotification('No .ir files selected. Please choose a folder containing .ir files.', 'error');
        return;
    }

    const deviceTypeName = elements.deviceTypeSelect.options[elements.deviceTypeSelect.selectedIndex].text;
    const deviceTypeFileName = elements.deviceTypeSelect.value;
    const normalizedDeviceType = deviceTypeName.toLowerCase();
    
    console.log("Selected device type:", deviceTypeName);
    console.log("Selected file name:", deviceTypeFileName);

    const allowedButtonNames = allowedButtons[normalizedDeviceType] || [];
    console.log("Allowed buttons:", allowedButtonNames);
    elements.processButton.disabled = true;
    resetProgress();
    elements.progressContainer.style.display = 'block';
    elements.summary.classList.remove('show');
    const detailedSummaryData = [];
    let totalButtonCounts = {};

    let totalSignals = 0;
    let newSignals = 0;
    let duplicateSignals = 0;
    let errorSignals = 0;
    let totalUnnamedRaw = 0;
    let totalRenamedButtons = 0;

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
            const stats = { duplicateCount: 0, buttonCounts: {}, unnamedRawCount: 0, renamedButtonCount: 0 };

            try {
                const content = await readFileContent(file);
                const deviceInfo = extractDeviceInfo(content, file.name);
                const filteredContent = filterIRContent(content, allowedButtonNames, existingSignalsIndex, stats, normalizedDeviceType);

                if (filteredContent) {
                    const commentLine = `# Model: ${deviceInfo}\n#\n`;
                    universalIRContent += `${commentLine}${filteredContent.trim()}\n`;

                    const signals = parseIRFileSignals(filteredContent, allowedButtonNames);
                    fileNewSignals = signals.length;
                    newSignals += fileNewSignals;
                    duplicateSignals += stats.duplicateCount;
                    totalUnnamedRaw += stats.unnamedRawCount;
                    totalRenamedButtons += stats.renamedButtonCount;

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
                unnamedRawCount: stats.unnamedRawCount,
                renamedButtonCount: stats.renamedButtonCount
            });
        }

        totalSignals = newSignals + duplicateSignals;
        elements.totalSignalsElem.textContent = totalSignals;
        elements.newSignalsElem.textContent = newSignals;
        elements.duplicateSignalsElem.textContent = duplicateSignals;
        elements.errorSignalsElem.textContent = errorSignals;
        
        // Update unnamed raw signals count in the summary
        const unnamedRawElem = document.getElementById('unnamed-raw');
        if (unnamedRawElem) {
            unnamedRawElem.textContent = totalUnnamedRaw;
        }

        // Update renamed buttons count in the summary
        const renamedButtonsElem = document.getElementById('renamed-buttons');
        if (renamedButtonsElem) {
            renamedButtonsElem.textContent = totalRenamedButtons;
        }

        populateDetailedSummary(detailedSummaryData);
        updateButtonSummary(totalButtonCounts, totalUnnamedRaw, totalRenamedButtons);
        elements.summary.classList.add('show');
        elements.exportSummaryBtn.disabled = false;
        elements.copySummaryBtn.disabled = false;

        showNotification('IR files have been successfully appended to the universal IR file.', 'success');

        const selectedRepo = elements.repoSelect.value;
        const downloadFileName = `${selectedRepo.toLowerCase()}-universal-ir-${deviceTypeName.replace(/\s+/g, '-').toLowerCase()}.ir`;
        downloadFile(universalIRContent, downloadFileName);
    } catch (error) {
        console.error('Error during processing:', error);
        showNotification(error.message, 'error');
    } finally {
        elements.processButton.disabled = false;
        elements.progressContainer.style.display = 'none';
    }
}
// Helper functions

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
    elements.totalSignalsElem.textContent = '0';
    elements.newSignalsElem.textContent = '0';
    elements.duplicateSignalsElem.textContent = '0';
    elements.errorSignalsElem.textContent = '0';
    elements.summary.classList.remove('show');
    elements.exportSummaryBtn.disabled = true;
    elements.copySummaryBtn.disabled = true;
}

function updateProgress(percent) {
    elements.progressBar.style.width = `${percent}%`;
    elements.progressBar.textContent = `${Math.floor(percent)}%`;
}

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
// Function to parse universal IR file and index existing signals
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

    for (let i = 0; i < lines.length; i++) {
        let line = lines[i].trim();
        let nextLine = (i + 1 < lines.length) ? lines[i + 1].trim() : '#'; // Boundary check

        // Debugging logs
        console.log(`Processing line ${i}: ${line}`);
        console.log(`Next line ${i + 1}: ${nextLine}`);

        if (line.startsWith('#') || line === '' || i === lines.length - 1) {
            if (isValidSignal(currentSignal)) {
                const key = generateSignalKey(currentSignal);
                existingSignals.set(key, currentSignal);
                console.log(`Added signal: ${JSON.stringify(currentSignal)}`);
            } else {
                console.log(`Invalid or incomplete signal at line ${i}.`);
            }
            currentSignal = {};
            isRawSignal = false;
            rawLines = [];
        } else {
            if (line.startsWith('name:')) {
                currentSignal.name = line.split(':')[1].trim();
                console.log(`Extracted name: ${currentSignal.name}`);
            } else if (line.startsWith('type: raw')) {
                isRawSignal = true;
                rawLines.push(line);
                console.log('Detected raw signal type.');
            } else if (isRawSignal) {
                rawLines.push(line);
                console.log(`Appending to raw signal: ${line}`);
            } else {
                if (line.startsWith('protocol:')) {
                    currentSignal.protocol = line.split(':')[1].trim();
                    console.log(`Extracted protocol: ${currentSignal.protocol}`);
                } else if (line.startsWith('address:')) {
                    currentSignal.address = line.split(':')[1].trim();
                    console.log(`Extracted address: ${currentSignal.address}`);
                } else if (line.startsWith('command:')) {
                    currentSignal.command = line.split(':')[1].trim();
                    console.log(`Extracted command: ${currentSignal.command}`);
                }
            }
        }

        if (isRawSignal && (nextLine.startsWith('#') || nextLine === '')) {
            currentSignal.raw = rawLines.join('\n');
            console.log(`Finalized raw signal: ${currentSignal.raw}`);
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

function filterIRContent(content, allowedButtonNames, existingSignalsIndex, stats, deviceType) {
    console.log("Filtering content with allowed buttons:", allowedButtonNames);
    const allowedButtonNamesLower = new Set(allowedButtonNames.map(name => name.toLowerCase()));
    const lines = content.split('\n');
    let filteredContent = '';
    let signalLines = [];
    let includeSignal = false;
    let currentSignal = {};
    let isRawSignal = false;
    const buttonCounts = {};
    let rawSignalCounter = 0;
    let renamedButtonCount = 0;

    for (let i = 0; i <= lines.length; i++) {
        let line = (i < lines.length) ? lines[i] : '#';
        if (line.trim().startsWith('#') || line.trim() === '') {
            if (signalLines.length > 0) {
                if (isRawSignal && !currentSignal.name) {
                    currentSignal.name = generateDefaultRawName(++rawSignalCounter);
                    signalLines.unshift(`name: ${currentSignal.name}`);
                }
                
                if (isValidSignal(currentSignal)) {
                    const originalName = currentSignal.name;
                    let normalizedName = normalizeButtonName(originalName);
                    normalizedName = matchAndRenameButton(normalizedName, deviceType);
                    if (normalizedName !== originalName) {
                        renamedButtonCount++;
                        console.log(`Renamed button: ${originalName} -> ${normalizedName}`);
                    }
                    if (!isDuplicateSignal(currentSignal, existingSignalsIndex)) {
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
                let normalizedName = normalizeButtonName(buttonName);
                normalizedName = matchAndRenameButton(normalizedName, deviceType);
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
    stats.renamedButtonCount = renamedButtonCount;
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


function generateDefaultRawName(index) {
    return `Unnamed_Raw_${index}`;
}


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

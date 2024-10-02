// =========================
// Constants and Variables
// =========================

// DOM Elements
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

// Allowed buttons per device type
let allowedButtons = {
    'tv': ['Power', 'Vol_up', 'Vol_dn', 'Ch_next', 'Ch_prev', 'Mute'],
    'audio': ['Power', 'Vol_up', 'Vol_dn', 'Next', 'Prev', 'Mute', 'Play', 'Pause'],
    'ac': ['Off', 'Cool_hi', 'Cool_lo', 'Heat_hi', 'Heat_lo', 'Dh'],
    'fan': ['Power', 'Speed_up', 'Speed_dn', 'Mode', 'Rotate', 'Timer'],
    'led': ['POWER', 'BRIGHTNESS+', 'BRIGHTNESS-', 'FLASH'],
    'monitor': ['Power', 'Source', 'Menu', 'Exit'],
    'projector': ['Power', 'Vol_up', 'Vol_dn', 'Mute'],
    'digital_sign': ['Power', 'Source', 'Play', 'Stop']
    };

// Mapping of button names to standard names per device type
const buttonNameMapping = {
    "tv": {
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
    "audio": {
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
    "ac": {
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
        "poweroff": "Off",
        "turn_off": "Off",
        "turnoff": "Off",
        "shutdown": "Off",
        "shut_down": "Off",
        "off_button": "Off",
        "kill": "Off",
        "disable": "Off",
        "pwr": "Off",
        "powr": "Off",
        "pw": "Off",
        "po": "Off",
        "pwr_off": "Off",
        "powr_off": "Off",
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
    },
    "fans": {
        // Power
        "power": "Power",
        "pwr": "Power",
        "on(?:)?off": "Power",
        "switch": "Power",
        "toggle": "Power",
        // Speed Up
        "speed(?:)?up": "Speed_up",
        "faster": "Speed_up",
        "increase(?:)?speed": "Speed_up",
        "spd(?:)?up": "Speed_up",
        "speed(?:)?\+": "Speed_up",
        // Speed Down
        "speed(?:)?down": "Speed_dn",
        "speed(?:)?dn": "Speed_dn",
        "slower": "Speed_dn",
        "decrease(?:)?speed": "Speed_dn",
        "spd(?:)?dn": "Speed_dn",
        "speed(?:)?\-": "Speed_dn",
        // Mode
        "mode": "Mode",
        "function": "Mode",
        "air(?:)?flow": "Mode",
        "fan(?:)?mode": "Mode",
        // Rotate
        "rotate": "Rotate",
        "oscillate": "Rotate",
        "swing": "Rotate",
        "scan": "Rotate",
        // Timer
        "timer": "Timer",
        "auto(?:)?off": "Timer",
        "schedule": "Timer",
        "delay(?:)?off": "Timer"
    },
    "led": {
        // Power
        "power": "POWER",
        "pwr": "POWER",
        "on_?off": "POWER",
        "switch": "POWER",
        "toggle": "POWER",
        // Brightness Up
        "brightness\\+": "BRIGHTNESS+",
        "brightness_?up": "BRIGHTNESS+",
        "brighter": "BRIGHTNESS+",
        "intensify": "BRIGHTNESS+",
        "bright\\+": "BRIGHTNESS+",
        "bright_?up": "BRIGHTNESS+",
        // Brightness Down
        "brightness-": "BRIGHTNESS-",
        "brightness_?down": "BRIGHTNESS-",
        "dimmer": "BRIGHTNESS-",
        "soften": "BRIGHTNESS-",
        "bright-": "BRIGHTNESS-",
        "bright_?down": "BRIGHTNESS-",
        // Flash
        "flash": "FLASH",
        "strobe": "FLASH",
        "blink": "FLASH",
        "pulse": "FLASH"
    },
    "monitor": {
        // Power
        "power": "Power",
        "pwr": "Power",
        "on(?:)?off": "Power",
        "switch": "Power",
        "toggle": "Power",
        // Source
        "source": "Source",
        "input": "Source",
        "input(?:)?select": "Source",
        // Menu
        "menu": "Menu",
        "osd": "Menu",
        "on(?:)?screen(?:)?display": "Menu",
        "settings": "Menu",
        // Exit
        "exit": "Exit",
        "close": "Exit",
        "esc": "Exit"
    },
    "projectors": {
        // Power
        "power": "Power",
        "pwr": "Power",
        "on(?:)?off": "Power",
        "switch": "Power",
        "toggle": "Power",
        // Volume Up
        "vol(?:)?up": "Vol_up",
        "volume(?:)?up": "Vol_up",
        "vol(?:)?\+": "Vol_up",
        // Volume Down
        "vol(?:)?down": "Vol_dn",
        "vol(?:)?dn": "Vol_dn",
        "volume(?:)?down": "Vol_dn",
        "vol(?:)?\-": "Vol_dn",
        // Mute
        "mute": "Mute",
        "silence": "Mute",
        "quiet": "Mute"
    },
    "digital_sign": {
        // Power
        "power": "Power",
        "pwr": "Power",
        "on(?:)?off": "Power",
        "switch": "Power",
        "toggle": "Power",
        // Source
        "source": "Source",
        "input": "Source",
        "input(?:)?select": "Source",
        // Play
        "play": "Play",
        "start(?:)?content": "Play",
        "begin": "Play",
        // Stop
        "stop": "Stop",
        "end(?:_)?content": "Stop",
        "halt": "Stop"
    }
};

// Repositories information
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
            return standardName;
        }
    }

    // If no match found, return the normalized button name
    return normalizedButton;
}

// Generate a unique key for a signal with improved normalization
function generateSignalKey(signal) {
    if (signal.raw) {
        // Normalize raw signal
        const normalizedRaw = signal.raw
            .replace(/[\s,]+/g, ' ') // Replace multiple spaces or commas with a single space
            .trim();
        return 'raw_' + hashString(normalizedRaw);
    }

    // Normalize and standardize other attributes
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

// Check if a signal is a duplicate with enhanced criteria
function isDuplicateSignal(signal, existingSignalsIndex) {
    if (signal.raw || (signal.name && signal.protocol && signal.address && signal.command)) {
        const key = generateSignalKey(signal);
        return existingSignalsIndex.has(key);
    }
    return false;
}

// Parse the universal IR file and index existing signals with better normalization
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

    for (let i = 0; i <= lines.length; i++) {
        let line = (i < lines.length) ? lines[i].trim() : '#';

        if (line.startsWith('#') || line === '' || i === lines.length) {
            // End of a signal
            if (isRawSignal && rawLines.length > 0) {
                currentSignal.raw = rawLines.join('\n');
                rawLines = [];
            }
            if (isValidSignal(currentSignal)) {
                const key = generateSignalKey(currentSignal);
                existingSignals.set(key, currentSignal);
            }
            currentSignal = {};
            isRawSignal = false;
        } else {
            if (line.startsWith('name:')) {
                currentSignal.name = line.split(':')[1].trim();
            } else if (line.startsWith('type: raw')) {
                isRawSignal = true;
                rawLines = [];
                rawLines.push(line);
            } else if (isRawSignal) {
                rawLines.push(line);
            } else {
                // Normalize and extract attributes
                if (line.startsWith('protocol:')) {
                    currentSignal.protocol = line.split(':')[1].trim();
                } else if (line.startsWith('address:')) {
                    currentSignal.address = line.split(':')[1].trim();
                } else if (line.startsWith('command:')) {
                    currentSignal.command = line.split(':')[1].trim();
                } else if (line.startsWith('frequency:')) {
                    currentSignal.frequency = line.split(':')[1].trim();
                }
            }
        }
    }

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

// =========================
// GitHub API Functions
// =========================

// Fetch the universal IR file from GitHub
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

// Get list of IR asset files from GitHub
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

// =========================
// Main Functions
// =========================

// Helper function to handle raw signals
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
    return { currentSignal, rawSignalCounter, signalLines };
}

// Helper function to process a single signal
function processSingleSignal(signalLines, allowedButtonNamesLower, existingSignalsIndex, deviceType, stats) {
    let currentSignal = {};
    let includeSignal = false;
    let isRawSignal = false;
    let rawSignalCounter = stats.unnamedRawCount;

    for (const line of signalLines) {
        if (line.trim().startsWith('name:')) {
            const buttonName = line.split(':')[1].trim();
            let normalizedName = normalizeButtonName(buttonName);
            normalizedName = matchAndRenameButton(normalizedName, deviceType);
            currentSignal.name = normalizedName;
            includeSignal = allowedButtonNamesLower.has(normalizedName.toLowerCase());
            if (normalizedName !== buttonName) {
                stats.renamedButtonCount++;
            }
        } else if (line.trim().startsWith('type: raw')) {
            isRawSignal = true;
        } else if (!isRawSignal) {
            if (line.trim().startsWith('protocol:')) currentSignal.protocol = line.split(':')[1].trim();
            else if (line.trim().startsWith('address:')) currentSignal.address = line.split(':')[1].trim();
            else if (line.trim().startsWith('command:')) currentSignal.command = line.split(':')[1].trim();
        }
    }

    if (isRawSignal) {
        const result = processRawSignal(signalLines, currentSignal, rawSignalCounter);
        currentSignal = result.currentSignal;
        stats.unnamedRawCount = result.rawSignalCounter;
        signalLines = result.signalLines;
    }

    if (includeSignal && isValidSignal(currentSignal)) {
        if (!isDuplicateSignal(currentSignal, existingSignalsIndex)) {
            const key = generateSignalKey(currentSignal);
            existingSignalsIndex.set(key, currentSignal);
            stats.buttonCounts[currentSignal.name] = (stats.buttonCounts[currentSignal.name] || 0) + 1;
            return { includeSignal: true, signalLines: signalLines.join('\n') };
        } else {
            stats.duplicateCount++;
        }
    }

    return { includeSignal: false, signalLines: '' };
}

// Refactored filterIRContent function
function filterIRContent(content, allowedButtonNames, existingSignalsIndex, stats, deviceType) {
    console.log("Filtering content with allowed buttons:", allowedButtonNames);
    const allowedButtonNamesLower = new Set(allowedButtonNames.map(name => name.toLowerCase()));
    const lines = content.split('\n');
    let filteredContent = '';
    let signalLines = [];

    for (let i = 0; i <= lines.length; i++) {
        let line = (i < lines.length) ? lines[i] : '#';
        if (line.trim().startsWith('#') || line.trim() === '') {
            if (signalLines.length > 0) {
                const result = processSingleSignal(signalLines, allowedButtonNamesLower, existingSignalsIndex, deviceType, stats);
                if (result.includeSignal) {
                    filteredContent += result.signalLines + '\n#\n';
                }
                signalLines = [];
            }
        } else {
            signalLines.push(line);
        }
    }

    return filteredContent.trim();
}

// Refactored parseIRFileSignals function
function parseIRFileSignals(content, allowedButtonNames) {
    const allowedButtonNamesLower = new Set(allowedButtonNames.map(name => name.toLowerCase()));
    const lines = content.split('\n');
    let signals = [];
    let signalLines = [];

    for (let i = 0; i <= lines.length; i++) {
        let line = (i < lines.length) ? lines[i].trim() : '#';
        if (line.startsWith('#') || line === '') {
            if (signalLines.length > 0) {
                const result = processSingleSignal(signalLines, allowedButtonNamesLower, new Map(), '', { buttonCounts: {}, unnamedRawCount: 0, renamedButtonCount: 0 });
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

// The main processFiles function remains largely unchanged, but now uses these refactored functions
async function processFiles(irFiles) {
    if (irFiles.length === 0) {
        showNotification('No .ir files selected. Please choose a folder containing .ir files.', 'error');
        return;
    }

    const deviceTypeName = elements.deviceTypeSelect.options[elements.deviceTypeSelect.selectedIndex].text;
    const deviceTypeFileName = elements.deviceTypeSelect.value;
    const deviceType = deviceTypeName.toLowerCase(); // Ensure lowercase

    console.log("Selected device type:", deviceType);
    console.log("Selected file name:", deviceTypeFileName);

    const allowedButtonNames = allowedButtons[deviceType] || [];
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
                const filteredContent = filterIRContent(content, allowedButtonNames, existingSignalsIndex, stats, deviceType);

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
    
    // Update allowed buttons after updating device types
    await updateAllowedButtons();
}


// =========================
// Event Listeners and Initialization
// =========================

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

    // Update device types when repository changes
    elements.repoSelect.addEventListener('change', async () => {
        await updateDeviceTypeOptions();
    });

    // Export summary
    elements.exportSummaryBtn.addEventListener('click', exportSummary);

    // Copy summary
    elements.copySummaryBtn.addEventListener('click', copySummaryToClipboard);

    // Populate repository select
    populateRepoSelect();

    // Initial population of device type options
    updateDeviceTypeOptions();
});

// =========================
// Helper Functions
// =========================

// Update button text based on the current theme
function updateButtonText(theme) {
    elements.themeToggleButton.textContent = theme === 'dark-mode' ? 'Switch to Light Mode' : 'Switch to Dark Mode';
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

// Populate repository select options
function populateRepoSelect() {
    elements.repoSelect.innerHTML = '';
    Object.keys(REPOSITORIES).forEach(repoName => {
        const option = document.createElement('option');
        option.value = repoName;
        option.textContent = repoName;
        elements.repoSelect.appendChild(option);
    });
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

// Reset summary counts
function resetSummary() {
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

// Update button summary in the UI
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

// Populate detailed summary in the UI
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

// Export processing summary
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

// Copy summary to clipboard
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

// constants.js

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
    buttonSummaryElem: document.getElementById('button-summary'),
    universalFileOption: document.getElementsByName('universal-file-option'),
    repoSelectContainer: document.getElementById('repo-select-container'),
    manualUploadContainer: document.getElementById('manual-upload-container'),
    manualUniversalFile: document.getElementById('manual-universal-file'),
    manualFileName: document.getElementById('manual-file-name'),
};

let omitRawSignals = false;

// Allowed buttons per device type
let allowedButtons = {
    'tv': ['Power', 'Vol_up', 'Vol_dn', 'Ch_next', 'Ch_prev', 'Mute'],
    'audio': ['Power', 'Vol_up', 'Vol_dn', 'Next', 'Prev', 'Mute', 'Play', 'Pause'],
    'ac': ['Off', 'Cool_hi', 'Cool_lo', 'Heat_hi', 'Heat_lo', 'Dh'],
    'fan': ['Power', 'Speed_up', 'Speed_dn', 'Mode', 'Rotate', 'Timer'],
    'led': ['POWER', 'BRIGHTNESS+', 'BRIGHTNESS-', 'FLASH'],
    'monitor': ['POWER', 'SOURCE', 'MENU', 'EXIT'],
    'projector': ['Power', 'Vol_up', 'Vol_dn', 'Mute'],
    'digital_sign': ['Power', 'Source', 'Play', 'Stop'],
    'bluray_dvd': ['Power', 'Eject', 'Play', 'Pause', 'Ok', 'Fast_fo', 'Fast_ba', 'Subtitle']
};

// Mapping of button names to standard names per device type
const buttonNameMapping = {
    // ... (Include the entire buttonNameMapping object here)
};

// Repositories information
const REPOSITORIES = {
    'Momentum': {
        owner: 'Next-Flip',
        repo: 'Momentum-Firmware',
        branch: 'dev'
    },
    'Unleashed': {
        owner: 'DarkFlippers',
        repo: 'unleashed-firmware',
        branch: 'dev'
    },
    'Official': {
        owner: 'flipperdevices',
        repo: 'flipperzero-firmware',
        branch: 'dev'
    }
};

// GitHub API constants
const GITHUB_API_BASE = 'https://api.github.com/repos/flipperdevices/flipperzero-firmware';
const IR_ASSETS_PATH = 'applications/main/infrared/resources/infrared/assets';
const BRANCH = 'dev';

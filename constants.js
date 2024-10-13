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
        "power": "POWER",
        "pwr": "POWER",
        "on(?:)?off": "POWER",
        "switch": "POWER",
        "toggle": "POWER",
        // Source
        "source": "SOURCE",
        "input": "SOURCE",
        "input(?:)?select": "SOURCE",
        // Menu
        "menu": "MENU",
        "osd": "MENU",
        "on(?:)?screen(?:)?display": "MENU",
        "settings": "MENU",
        // Exit
        "exit": "EXIT",
        "close": "EXIT",
        "esc": "EXIT"
    },
    "projectors": {
        // Power
        "power": "Power",
        "pwr": "Power",
        "on(?:_)?off": "Power",
        "switch": "Power",
        "toggle": "Power",
        // Volume Up
        "vol(?:_)?up": "Vol_up",
        "volume(?:_)?up": "Vol_up",
        "vol\\+": "Vol_up",
        // Volume Down
        "vol(?:_)?down": "Vol_dn",
        "vol(?:_)?dn": "Vol_dn",
        "volume(?:_)?down": "Vol_dn",
        "vol\\-": "Vol_dn",
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
    },
    "bluray_dvd": {
        "power": "Power",
        "pwr": "Power",
        "powr": "Power",
        "on(?:_)?off": "Power",

        // Eject
        "eject": "Eject",
        "open(?:_)?close": "Eject",
        "disc": "Eject",
        "ej(?:e)?(?:c)?(?:t)?": "Eject",
        "op(?:e)?n(?:_)?cl(?:o)?se": "Eject",

        // Play
        "play": "Play",
        "start(?:_)?playback": "Play",
        "resume": "Play",
        "ply": "Play",
        "go": "Play",

        // Pause
        "pause": "Pause",
        "pause(?:_)?playback": "Pause",
        "break": "Pause",
        "paus(?:e)?": "Pause",
        "ps(?:e)?": "Pause",

        // Stop
        "stop": "Stop",
        "end(?:_)?playback": "Stop",
        "halt": "Stop",
        "stp": "Stop",

        // Fast Forward
        "fast(?:_)?fo": "Fast_fo",
        "fast(?:_)?forward": "Fast_fo",
        "ffwd": "Fast_fo",
        "ff": "Fast_fo",
        "f(?:_)?fwd": "Fast_fo",
        "fwd": "Fast_fo",

        // Fast Backward
        "fast(?:_)?ba": "Fast_ba",
        "fast(?:_)?backward": "Fast_ba",
        "rewind": "Fast_ba",
        "rew": "Fast_ba",
        "rw(?:d)?": "Fast_ba",
        "bwd": "Fast_ba",

        // Next
        "next": "Next",
        "skip(?:_)?forward": "Next",
        "track(?:_)?next": "Next",
        "nxt": "Next",
        "skip(?:_)?fwd": "Next",

        // Previous
        "prev": "Prev",
        "skip(?:_)?backward": "Prev",
        "track(?:_)?prev": "Prev",
        "previous": "Prev",
        "skip(?:_)?back": "Prev",

        // Menu
        "menu": "Menu",
        "disc(?:_)?menu": "Menu",
        "root(?:_)?menu": "Menu",
        "mnu": "Menu",
        "dvd(?:_)?menu": "Menu",

        // Top Menu
        "top(?:_)?menu": "Top_menu",
        "title(?:_)?menu": "Top_menu",
        "main(?:_)?menu": "Top_menu",
        "t(?:op)?(?:_)?mnu": "Top_menu",

        // Setup
        "setup": "Setup",
        "settings": "Setup",
        "config": "Setup",
        "set(?:_)?up": "Setup",
        "conf(?:ig)?": "Setup",

        // Home
        "home": "Home",
        "main": "Home",
        "hme": "Home",

        // Audio
        "audio": "Audio",
        "sound(?:_)?track": "Audio",
        "language": "Audio",
        "lang": "Audio",
        "aud(?:io)?": "Audio",

        // Subtitle
        "subtitle": "Subtitle",
        "captions": "Subtitle",
        "cc": "Subtitle",
        "subs": "Subtitle",
        "sub(?:title)?s?": "Subtitle",

        // Angle
        "angle": "Angle",
        "camera(?:_)?angle": "Angle",
        "view": "Angle",
        "ang(?:le)?": "Angle",
        "cam(?:era)?(?:_)?(?:ang(?:le)?)?": "Angle",

        // Zoom
        "zoom": "Zoom",
        "magnify": "Zoom",
        "enlarge": "Zoom",
        "zm": "Zoom",

        // Okay
        "okay": "Ok",
        "Okay": "Ok",
        "ok": "Ok",
        "select": "Ok",
        "enter": "Ok",
        "yes": "Ok",
        "sel": "Ok",
        "confirm": "Ok",

        // Navigation
        "up": "Up",
        "down": "Down",
        "left": "Left",
        "right": "Right",

        // Color buttons
        "red": "Red",
        "green": "Green",
        "yellow": "Yellow",
        "blue": "Blue",
        "r": "Red",
        "g": "Green",
        "y": "Yellow",
        "b": "Blue"
    }
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

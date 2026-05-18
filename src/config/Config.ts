const STORAGE_PREFIX = 'solkost_klondike_';
const k = (key: string) => STORAGE_PREFIX + key;

export var STOCK_THREE_MODE_ACTIVE: boolean = false;
export var RIGHT_HANDED_MODE_ACTIVE: boolean;
export var RIGHT_HANDED_MODE_IDX : number;
export var AUTOFINISH_MODE_ACTIVE: boolean = true;
export var SOUND_ACTIVE: boolean = true;
export var NIGHT_MODE_ACTIVE : boolean = false;
export var DRAG_ACTIVE : boolean = true;

export function loadDefaultSettings(isMobile : boolean = false) {
    if (RIGHT_HANDED_MODE_ACTIVE == undefined || RIGHT_HANDED_MODE_ACTIVE == null) {
        if (isMobile) {
            RIGHT_HANDED_MODE_ACTIVE = true;
        } else {
            RIGHT_HANDED_MODE_ACTIVE = false;
        }
        RIGHT_HANDED_MODE_IDX = RIGHT_HANDED_MODE_ACTIVE ? 1 : 0;
    }
}

// Load saved settings from localStorage
export function loadSettings() {
    const stockThreeMode = localStorage.getItem(k('STOCK_THREE_MODE_ACTIVE'));
    if (stockThreeMode !== null) {
        STOCK_THREE_MODE_ACTIVE = JSON.parse(stockThreeMode);
    }

    const rightHandedMode = localStorage.getItem(k('RIGHT_HANDED_MODE_ACTIVE'));
    if (rightHandedMode !== null) {
        RIGHT_HANDED_MODE_ACTIVE = JSON.parse(rightHandedMode);
    }

    const rightHandedModeIdx = localStorage.getItem(k('RIGHT_HANDED_MODE_IDX'));
    if (rightHandedModeIdx !== null) {
        RIGHT_HANDED_MODE_IDX = JSON.parse(rightHandedModeIdx);
    }

    const autofinishMode = localStorage.getItem(k('AUTOFINISH_MODE_ACTIVE'));
    if (autofinishMode !== null) {
        AUTOFINISH_MODE_ACTIVE = JSON.parse(autofinishMode);
    }

    const soundActive = localStorage.getItem(k('SOUND_ACTIVE'));
    if (soundActive !== null) {
        SOUND_ACTIVE = JSON.parse(soundActive);
    }

    const nightMode = localStorage.getItem(k('NIGHT_MODE_ACTIVE'));
    if (nightMode !== null) {
        NIGHT_MODE_ACTIVE = JSON.parse(nightMode);
    }
}

export function toggleThreeModeActive(params: boolean) {
    STOCK_THREE_MODE_ACTIVE = params;
    localStorage.setItem(k('STOCK_THREE_MODE_ACTIVE'), JSON.stringify(params));
}

export function toggleRightHandedActive(params: boolean) {
    RIGHT_HANDED_MODE_ACTIVE = params;
    RIGHT_HANDED_MODE_IDX = params ? 1 : 0;
    localStorage.setItem(k('RIGHT_HANDED_MODE_ACTIVE'), JSON.stringify(params));
    localStorage.setItem(k('RIGHT_HANDED_MODE_IDX'), JSON.stringify(RIGHT_HANDED_MODE_IDX));
}

export function toggleAutofinishActive(params: boolean) {
    AUTOFINISH_MODE_ACTIVE = params;
    localStorage.setItem(k('AUTOFINISH_MODE_ACTIVE'), JSON.stringify(params));
}

export function toggleSoundActive(params: boolean) {
    SOUND_ACTIVE = params;
    localStorage.setItem(k('SOUND_ACTIVE'), JSON.stringify(params));
}

export function toggleNightModeActive(params: boolean) {
    NIGHT_MODE_ACTIVE = params;
    localStorage.setItem(k('NIGHT_MODE_ACTIVE'), JSON.stringify(params));
}

export function setDragActive(val:boolean) {
    DRAG_ACTIVE = val;
}

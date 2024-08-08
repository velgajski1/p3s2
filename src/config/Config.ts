import { GameManager } from "../managers/GameManager";
import Preloader from "../scenes/Preloader";

export var STOCK_THREE_MODE_ACTIVE: boolean = false;
export var RIGHT_HANDED_MODE_ACTIVE: boolean;
export var RIGHT_HANDED_MODE_IDX : number;
export var AUTOFINISH_MODE_ACTIVE: boolean = true;
export var SOUND_ACTIVE: boolean = true;
export var BG_INDEX : number = 0;
export var DRAG_ACTIVE : boolean = true;

export function loadDefaultSettings() {
    console.log(RIGHT_HANDED_MODE_ACTIVE)
    if (RIGHT_HANDED_MODE_ACTIVE == undefined || RIGHT_HANDED_MODE_ACTIVE == null) {
        if (GameManager.isMobile) {
            RIGHT_HANDED_MODE_ACTIVE = true;
        } else {
            RIGHT_HANDED_MODE_ACTIVE = false;
        }
        RIGHT_HANDED_MODE_IDX = RIGHT_HANDED_MODE_ACTIVE ? 1 : 0;
    }
}

// Load saved settings from localStorage
export function loadSettings() {
    
    const stockThreeMode = localStorage.getItem('STOCK_THREE_MODE_ACTIVE');
    if (stockThreeMode !== null) {
        STOCK_THREE_MODE_ACTIVE = JSON.parse(stockThreeMode);
    }

    const rightHandedMode = localStorage.getItem('RIGHT_HANDED_MODE_ACTIVE');
    if (rightHandedMode !== null) {
        RIGHT_HANDED_MODE_ACTIVE = JSON.parse(rightHandedMode);
    } 

    const rightHandedModeIdx = localStorage.getItem('RIGHT_HANDED_MODE_IDX');
    if (rightHandedModeIdx !== null) {
        RIGHT_HANDED_MODE_IDX = JSON.parse(rightHandedModeIdx);
    }

    const autofinishMode = localStorage.getItem('AUTOFINISH_MODE_ACTIVE');
    if (autofinishMode !== null) {
        AUTOFINISH_MODE_ACTIVE = JSON.parse(autofinishMode);
    }

    const soundActive = localStorage.getItem('SOUND_ACTIVE');
    if (soundActive !== null) {
        SOUND_ACTIVE = JSON.parse(soundActive);
    }

    const bgIndex = localStorage.getItem('BG_INDEX');
    if (bgIndex !== null) {
        BG_INDEX = JSON.parse(bgIndex);
    }
}

export function toggleThreeModeActive(params: boolean) {
    STOCK_THREE_MODE_ACTIVE = params;
    localStorage.setItem('STOCK_THREE_MODE_ACTIVE', JSON.stringify(params));
}

export function toggleRightHandedActive(params: boolean, skipDispatch: boolean = false) {
    RIGHT_HANDED_MODE_ACTIVE = params;
    RIGHT_HANDED_MODE_IDX = params ? 1 : 0;
    localStorage.setItem('RIGHT_HANDED_MODE_ACTIVE', JSON.stringify(params));
    localStorage.setItem('RIGHT_HANDED_MODE_IDX', JSON.stringify(RIGHT_HANDED_MODE_IDX));
}

export function toggleAutofinishActive(params: boolean) {
    AUTOFINISH_MODE_ACTIVE = params;
    localStorage.setItem('AUTOFINISH_MODE_ACTIVE', JSON.stringify(params));
}

export function toggleSoundActive(params: boolean) {
    SOUND_ACTIVE = params;
    localStorage.setItem('SOUND_ACTIVE', JSON.stringify(params));
}

export function setBgIdx(params: number) {
    BG_INDEX = params;
    localStorage.setItem('BG_INDEX', JSON.stringify(params));
}

export function setDragActive(val:boolean) {
    DRAG_ACTIVE = val;
}

// Call this function during initialization to load saved settings
// loadSettings();

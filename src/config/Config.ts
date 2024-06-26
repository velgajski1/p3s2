export var STOCK_THREE_MODE_ACTIVE: boolean = false;
export var RIGHT_HANDED_MODE_ACTIVE: boolean = false;
export var AUTOFINISH_MODE_ACTIVE: boolean = true;
export var SOUND_ACTIVE: boolean = true;
export var BG_INDEX : number = 0;

export function toggleThreeModeActive(params:boolean) {
    // console.log("set to: " + params);
    STOCK_THREE_MODE_ACTIVE=params;
}

export function toggleRightHandedActive(params:boolean) {
    // console.log("set to: " + params);
    RIGHT_HANDED_MODE_ACTIVE=params;
}

export function toggleAutofinishActive(params:boolean) {
    console.log("set autofinish to: " + params);
    AUTOFINISH_MODE_ACTIVE=params;
}

export function toggleSoundActive(params:boolean) {
    // console.log("set to: " + params);
    SOUND_ACTIVE=params;
}

export function setBgIdx(params:number) {
    // console.log("set to: " + params);
    BG_INDEX=params;
}
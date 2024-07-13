export const BACKGROUND_COLORS = [
    '#367a37', '#37864f', '#226632', '#014001', '#3b403c',
    '#3d444e', '#575759', '#7b5f4a', '#4d5e72', '#616d95',
    '#42678e', '#2d5f80', '#3b7aa6', '#008080', '#2b8063',
    '#428e7f', '#5a8495', '#8a8697', '#b1aeae'
];

// Define a new constant for stat labels
export const STAT_LABELS = {
    GamesPlayed: 'Games Played',
    GamesWon: 'Games Won',
    WinPercentage: 'Win Percentage',
    CurrentWinStreak: 'Current Win Streak',
    LongestWinStreak: 'Longest Win Streak',
    TopScore: 'Top Score',
    BestTime: 'Best Time',
};

export enum PileType {
    Tableau = 'Tableau',
    Foundation = 'Foundation',
    Stock = 'Stock',
    Waste = 'Waste',
    Transition = 'Transition'
}

export const CARD_SCALE = 0.75;
export const WASTE_DELTA_FROM_STOCK = [160, -160];
export const STOCK_COORDS = { x : [-488, -488+6*WASTE_DELTA_FROM_STOCK[0]], y : 80 };
export const WASTE_OVERLAP = 0;
export const WASTE_DELTA_X  = [30,30];
export const TABLEU_COORDS_INIT = { x : STOCK_COORDS.x[0], y : 290 }
export const TABLEU_COORDS_DELTA = {x:160, y:34, y_covered:14}
export const FOUNDATION_COORDS_INIT = {x:[STOCK_COORDS.x[0] + WASTE_DELTA_FROM_STOCK[0]*3, STOCK_COORDS.x[1] - WASTE_DELTA_FROM_STOCK[0]*3], y:80}
export const FOUNDATION_COORDS_DELTA = {x:[160, -160], y:0}
export const CARD_MOVE_BEFORE_DRAG_ACTIVE = 0.1;
export const TABLEU_STACK_TWEEN_DURATION = 300;
export const DISABLE_CLICK_DURATION_NORMAL = 40
export const DISABLE_CLICK_DURATION_STOCK = 80;
export const TABLEU_FOLD_HEIGHT = 700;
export const FOLD_PIXELS_RATE = 20;
export const HINT_OVERLAY_DURATION = 600
export const HINT_NEXT_OVERLAY_DELTA = 250;






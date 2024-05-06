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
    Waste = 'Waste'
}

export const CARD_SCALE = 0.75;
export const STOCK_COORDS = { x : -488, y : -300 };
export const WASTE_DELTA_FROM_STOCK = 160;
export const WASTE_OVERLAP = 15;
export const TABLEU_COORDS_INIT = { x : STOCK_COORDS.x, y : -100 }
export const TABLEU_COORDS_DELTA = {x:160, y:30}
export const FOUNDATION_COORDS_INIT = {x:STOCK_COORDS.x + WASTE_DELTA_FROM_STOCK*3, y:-300}
export const FOUNDATION_COORDS_DELTA = {x:160, y:0}






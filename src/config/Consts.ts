export enum PileType
{
    Tableau = 'Tableau',
    Foundation = 'Foundation',
    Stock = 'Stock',
    Waste = 'Waste',
    Transition = 'Transition'
}

export const getCardScale = () =>
{
    // Replace `condition` with your actual condition logic

    if (innerWidth > innerHeight)
    {
        return 0.75; // Return a smaller scale for specific cases
    } else
    {
        return 0.8; // Default scale
    }
};


export const CARD_SCALE = 0.8;
export const WASTE_DELTA_FROM_STOCK = [160, -160];
export const STOCK_COORDS = { x: [-480, -480 + 6 * WASTE_DELTA_FROM_STOCK[0]], y: 80 };
export const WASTE_OVERLAP = 0;
export const WASTE_DELTA_X = [30, 30];
export const TABLEU_COORDS_INIT = { x: STOCK_COORDS.x[0], y: 290 }
export const TABLEU_COORDS_DELTA = { x: 160, y: 34, y_covered: 14 }
export const FOUNDATION_COORDS_INIT = { x: [STOCK_COORDS.x[0] + WASTE_DELTA_FROM_STOCK[0] * 3, STOCK_COORDS.x[1] - WASTE_DELTA_FROM_STOCK[0] * 3], y: 80 }
export const FOUNDATION_COORDS_DELTA = { x: [160, -160], y: 0 }
export const CARD_MOVE_BEFORE_DRAG_ACTIVE = 0.1;
export const CARD_MOVE_BEFORE_DRAG_AND_DROP = 80;
export const TABLEU_STACK_TWEEN_DURATION = 300;
export const DISABLE_CLICK_DURATION_NORMAL = 40
export const DISABLE_CLICK_DURATION_STOCK = 20;
export const TABLEU_FOLD_HEIGHT = 700;
export const FOLD_PIXELS_RATE = 20;
export const HINT_OVERLAY_DURATION = 600
export const HINT_NEXT_OVERLAY_DELTA = 250;
export const TAB_DELTA_Y_MOBILE_EXTRA = 31;

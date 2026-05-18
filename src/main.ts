import { BackgroundScene } from './scenes/BackgroundScene';
import { Boot } from './scenes/Boot';
import { GameplayScene } from './scenes/GameplayScene';
import { Preloader } from './scenes/Preloader';

import { Game, Types } from "phaser";
import { UIScene } from './scenes/UIScene';
import { Settings } from './scenes/Settings';
import { Statistics } from './scenes/Statistics';
import { WonScene } from './scenes/WonScene';

declare global {
    interface Window {
        __solitaireGame?: Game;
    }
}

const config: Types.Core.GameConfig = {
    type: Phaser.AUTO,
    width: 1024,
    height: 768,
    parent: 'game-container',
    backgroundColor: '#3b3b3b',
    roundPixels: true,
    input: {
        mouse: {
            preventDefaultWheel: false
        }
    },
    scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    scene: [
        Boot,
        BackgroundScene,
        Preloader,
        Settings,
        Statistics,
        GameplayScene,
        UIScene,
        WonScene
    ]
};

window.__solitaireGame?.destroy(true);
window.__solitaireGame = new Game(config);

export default window.__solitaireGame;

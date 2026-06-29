import { Boot } from './scenes/Boot';
import { GameplayScene } from './scenes/GameplayScene';
import { Preloader } from './scenes/Preloader';

import { Game, Types } from "phaser";
import { UIScene } from './scenes/UIScene';
import { Settings } from './scenes/Settings';
import { Statistics } from './scenes/Statistics';
import { WonScene } from './scenes/WonScene';
import { NewGameConfirmScene } from './scenes/NewGameConfirmScene';
import { VERSION } from './config/Config';

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
    transparent: true, // canvas is transparent so the CSS body background can show through when needed
    roundPixels: true,
    input: {
        mouse: {
            preventDefaultWheel: false
        }
    },
    scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        fullscreenTarget: 'app'
    },
    scene: [
        Boot,
        Preloader,
        Settings,
        Statistics,
        GameplayScene,
        UIScene,
        WonScene,
        NewGameConfirmScene
    ]
};

window.__solitaireGame?.destroy(true);
window.__solitaireGame = new Game(config);

// Show the build version in the bottom-left corner (sourced from the bundle).
const versionEl = document.getElementById('version-tag');
if (versionEl) versionEl.textContent = VERSION;

export default window.__solitaireGame;

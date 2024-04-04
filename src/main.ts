import { BackgroundScene } from './scenes/BackgroundScene';
import { Boot } from './scenes/Boot';
import { GameplayScene } from './scenes/GameplayScene';
import { GameOver } from './scenes/GameOver';
import { MainMenu } from './scenes/MainMenu';
import { Preloader } from './scenes/Preloader';

import { Game, Types } from "phaser";
import { UIScene } from './scenes/UIScene';
import { Settings } from './scenes/Settings';
import { Statistics } from './scenes/Statistics';
import { WonScene } from './scenes/WonScene';

//  Find out more information about the Game Config at:
//  https://newdocs.phaser.io/docs/3.70.0/Phaser.Types.Core.GameConfig
const config: Types.Core.GameConfig = {
    type: Phaser.AUTO,
    width: 1024,
    height: 768,
    parent: 'game-container',
    backgroundColor: '#028af8',
    roundPixels: true,
    scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    scene: [
        Boot,
        BackgroundScene,
        Preloader,
        MainMenu,
        Settings, 
        Statistics,
        GameplayScene,
        UIScene,
        WonScene,
        GameOver
    ]
};

export default new Game(config);

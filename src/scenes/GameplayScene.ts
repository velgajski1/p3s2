import Phaser from 'phaser';
import { GameManager } from '../managers/GameManager';
import Registry from '../config/Registry';
import Card from '../elements/Card';
import { CardNameManager, Rank, Suit } from '../managers/CardNameManager';
import { PileType } from '../config/Consts';

export class GameplayScene extends Phaser.Scene {
    private gameplayContainer!: Phaser.GameObjects.Container;
    gameManager: GameManager;

    constructor() {
        super('GameplayScene');
    }

    create(): void {
        this.gameplayContainer = this.add.container(this.scale.width / 2, this.scale.height / 2);
        

        // Initialize the GameManager with this scene and the UIScene
        this.gameManager = GameManager.getInstance(this, this.gameplayContainer);
        this.registry.set('gameManager', this.gameManager);

        // Start the game
        this.gameManager.startGame();

        // Listen for resize events to dynamically adjust the container
        this.scale.on('resize', this.resize, this);
        this.resize(this.scale.gameSize as unknown as Phaser.Structs.Size);

        this.scene.launch("UIScene");
    }

    private resize(gameSize: Phaser.Structs.Size): void {
        
        const { width, height } = gameSize;
        this.gameplayContainer.setPosition(width / 2, Math.max(60, height * 0.08 + 20*width / height));
        let scale = Math.min(width / 1600, height / 900);
        this.gameplayContainer.setScale(scale);

        const adjustedStartX = (width / 2) + -554 * scale;
        Registry.uiTextStartX = adjustedStartX

        Registry.uiElemStartX = width / 2 +400 * scale;
    }


}



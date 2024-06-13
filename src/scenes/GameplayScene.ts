import Phaser from 'phaser';
import { GameManager } from '../managers/GameManager';
import Registry from '../config/Registry';
import Card from '../elements/Card';
import { CardNameManager, Rank, Suit } from '../managers/CardNameManager';
import { PileType } from '../config/Consts';
import BaseScene from './BaseScene';

export class GameplayScene extends BaseScene {
    private gameplayContainer!: Phaser.GameObjects.Container;
    gameManager: GameManager;

    constructor() {
        super('GameplayScene');
    }

    

    create(): void {
        super.create()
        this.gameplayContainer = this.add.container(this.scale.width / 2, this.scale.height / 2);
        

        // Initialize the GameManager with this scene and the UIScene
        this.gameManager = GameManager.getInstance(this, this.gameplayContainer);
        this.registry.set('gameManager', this.gameManager);

        // Start the game
        this.gameManager.startGame();

        // Listen for resize events to dynamically adjust the container
        this.scale.on('resize', this.resize, this);
        

        this.scene.launch("UIScene");

        this.game.canvas.addEventListener('contextmenu', function (event) {
            event.preventDefault();
        })

            // Listen for the custom event
        this.events.once('restartScene', this.restartScene, this);
        this.resize(this.scale.gameSize as unknown as Phaser.Structs.Size);

    }

    private resize(gameSize: Phaser.Structs.Size): void {
        this.doResize(gameSize);
        setTimeout(() => {
            this.doResize(gameSize);
        }, 10);

    }

    private doResize(gameSize: Phaser.Structs.Size) : void {
        const { width, height } = gameSize;
        let topUI = this.registry.get("topUiWidthPercentage");
        if (topUI==undefined) topUI = 0.04;
        let scale = Math.min(width / 1200, height / 900);
        this.gameplayContainer.setScale(scale);
        this.gameplayContainer.setPosition(width / 2, height * (0.04 + topUI));
        console.log(height*(0.07+topUI), width, height);

        const adjustedStartX = (width / 2) + -554 * scale;
        Registry.uiTextStartX = adjustedStartX
        Registry.uiElemStartX = width / 2 +400 * scale; 
    }


    private restartScene(): void {
        // Stop the UIScene if it needs to be stopped
        this.scene.stop("UIScene");
        this.scene.stop("GameplayScene");

        // Restart the GameplayScene
        this.scene.restart();
    }

}



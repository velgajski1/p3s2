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
        this.gameManager = new GameManager(this, this.gameplayContainer);
        this.registry.set('gameManager', this.gameManager);

        // Start the game
        this.gameManager.startGame();

        // Define the layout
        const rows = 2;
        const cols = 7;
        const cardSpacingHorizontal = 40; // Spacing between cards
        const cardSpacingVertical = 50; // Spacing between cards
        const cardWidth = 171; // Assuming a card width of 71 pixels
        const cardHeight = 196; // Assuming a card height of 96 pixels
        const cardScale = 0.75; // Adjust this scale factor to make cards smaller
        const startX = -(cols - 1) * (cardWidth * cardScale + cardSpacingHorizontal) / 2; // Adjusted for scale
        const startY = -(rows - 1) * (cardHeight * cardScale + cardSpacingVertical) / 2; // Adjusted for scale
        console.log(startX, startY);

        // // Loop to create a grid of cards
        // for (let row = 0; row < rows; row++) {
        //     for (let col = 0; col < cols; col++) {
        //         const x = startX + col * (cardWidth * cardScale + cardSpacingHorizontal);
        //         const y = startY + row * (cardHeight * cardScale + cardSpacingVertical);
        //         // Use the Card class here
        //         const card = new Card(this, x, y, getCardName(Suit.Clubs, Rank.Two),true, PileType.Foundation, 3).setScale(cardScale);
        //         this.gameplayContainer.add(card);
        //     }
        // }



        // Listen for resize events to dynamically adjust the container
        this.scale.on('resize', this.resize, this);
        this.resize(this.scale.gameSize as unknown as Phaser.Structs.Size);

        this.scene.launch("UIScene");
    }

    private resize(gameSize: Phaser.Structs.Size): void {
        
        const { width, height } = gameSize;
        this.gameplayContainer.setPosition(width / 2, height / 2+60);
        let scale = Math.min(width / 1600, height / 900);
        this.gameplayContainer.setScale(scale);

        const adjustedStartX = (width / 2) + -554 * scale;
        Registry.uiTextStartX = adjustedStartX

        Registry.uiElemStartX = width / 2 +400 * scale;
    }


}



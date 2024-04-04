import Phaser from 'phaser';

export class GameplayScene extends Phaser.Scene {
    private gameplayContainer!: Phaser.GameObjects.Container;

    constructor() {
        super('GameplayScene');
    }

    create(): void {
        this.gameplayContainer = this.add.container(this.scale.width / 2, this.scale.height / 2);

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

        // Loop to create a grid of cards
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                const x = startX + col * (cardWidth * cardScale + cardSpacingHorizontal);
                const y = startY + row * (cardHeight * cardScale + cardSpacingVertical);
                const card = this.add.sprite(x, y, 'ace').setScale(cardScale); // Apply scale here
                this.gameplayContainer.add(card);
            }
        }

        // Listen for resize events to dynamically adjust the container
        this.scale.on('resize', this.resize, this);
        this.resize(this.scale.gameSize as unknown as Phaser.Structs.Size);

        this.scene.launch("UIScene");
    }

    private resize(gameSize: Phaser.Structs.Size): void {
        const { width, height } = gameSize;
        this.gameplayContainer.setPosition(width / 2, height / 2+20);
        let scale = Math.min(width / 1600, height / 900);
        this.gameplayContainer.setScale(scale);
    }
}

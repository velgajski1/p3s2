import Phaser from 'phaser';

export class UIScene extends Phaser.Scene {
    constructor() {
        super('UIScene');
    }

    create(): void {
        // Create UI elements here
        console.log("ui")
        const textStyle: Phaser.Types.GameObjects.Text.TextStyle = { 
            fontSize: '32px', 
            color: '#FFFFFF' 
        };
        this.add.text(10, 10, 'UI Scene Text Example', textStyle);

        // Setup interactions or additional UI components
    }
}

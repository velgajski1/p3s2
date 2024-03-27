import Phaser from 'phaser';

export class BackgroundScene extends Phaser.Scene {
    constructor() {
        super('BackgroundScene');
    }

    preload(): void {
        // Preload assets for the background
        this.cameras.main.setBackgroundColor('#222299');
    }

    create(): void {
        // Add and set up background assets
        this.add.image(0, 0, 'background').setOrigin(0, 0);
        // Additional setup as needed
    }
}

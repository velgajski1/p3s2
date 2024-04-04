import Phaser from 'phaser';

export class UIScene extends Phaser.Scene {
    gameplayContainer: Phaser.GameObjects.Container;
    constructor() {
        super('UIScene');
    }

    create(): void {
        // Create UI elements here
        console.log("ui")
        this.gameplayContainer = this.add.container(this.scale.width / 2, this.scale.height / 2);
        const textStyle: Phaser.Types.GameObjects.Text.TextStyle = { 
            fontSize: '32px', 
            color: '#FFFFFF' 
        };
        let t = this.add.text(-600, -350, 'UI Scene Text Example', textStyle);
        this.gameplayContainer.add(t);

       


        this.scale.on('resize', this.resize, this);
        this.resize(this.scale.gameSize as unknown as Phaser.Structs.Size);
        // Setup interactions or additional UI components
    }

    private resize(gameSize: Phaser.Structs.Size): void {
        const { width, height } = gameSize;
        this.gameplayContainer.setPosition(width / 2, height / 2+20);
        let scale = Math.min(width / 1600, height / 900);
        this.gameplayContainer.setScale(scale);
    }
}

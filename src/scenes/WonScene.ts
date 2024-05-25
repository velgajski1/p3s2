import Phaser from 'phaser';
import ButtonWithColorBackground from '../ui/ButtonWithColorBackground';
import { formatTime } from '../utils/Utils';
import { translate } from '../utils/Language';
import { LanguageConfig } from '../config/Language';

export class WonScene extends Phaser.Scene {
    private menuContainer!: Phaser.GameObjects.Container;
    private modalBackground!: Phaser.GameObjects.Graphics;
    private whiteBg!: Phaser.GameObjects.Graphics;
    private closeButton!: Phaser.GameObjects.Image;
    private newGameButton!: ButtonWithColorBackground;

    constructor(public score : number = 0, public timePlayed : number  = 0, public timeBonus : number  = 0, public totalScore : number = 0) {
        super('WonScene');
    }

    create(): void {
        this.createModalBackground();
        this.createMenuContainer();
        this.createWhiteBackground();
        this.createTextElements();
        this.createNewGameButton();
        this.createCloseButton();
        this.scaleMenuContainer();

        // Listen for resize events
        this.scale.on('resize', this.scaleMenuContainer, this);
    }

    private createModalBackground(): void {
        this.modalBackground = this.add.graphics({ fillStyle: { color: 0x000000, alpha: 0.5 } });
        this.modalBackground.fillRect(0, 0, this.scale.width, this.scale.height);
    }

    private createMenuContainer(): void {
        this.menuContainer = this.add.container(this.scale.width / 2, this.scale.height / 2);
    }

    private createWhiteBackground(): void {
        this.whiteBg = this.add.graphics({ fillStyle: { color: 0xffffff, alpha: 1 } });
        this.whiteBg.fillRoundedRect(-150, -125, 300, 300, 8);
        this.menuContainer.add(this.whiteBg);
    }

    private createTextElements(): void {
        // Title
        const title = this.add.text(-125, -110, 'You Won :)', {
            fontFamily: 'Open Sans', 
            fontSize: '32px', 
            color: '#000000', 
            align: 'center',
            fontStyle: 'bold'
        }).setOrigin(0);
    
        // Each label and value pair will be added to the container separately
        const labels = [
            translate(LanguageConfig.Score), 
            translate(LanguageConfig.TimePlayed), 
            translate(LanguageConfig.TimeBonus), 
            translate(LanguageConfig.TotalScore)
        ];
        const values = [
            this.score, // Example value, replace with actual game data
            formatTime(this.timePlayed, "hh:mm:ss"), // Example value, replace with actual game data
            this.timeBonus, // Example value, replace with actual game data
            this.totalScore // Example value, replace with actual game data
        ];
        
        const labelStyle = {
            fontFamily: 'Open Sans', 
            fontSize: '24px', 
            color: '#000000'
        };
        const valueStyle = {
            ...labelStyle,
            fontStyle: 'bold'
        };
    
        labels.forEach((label, index) => {
            let deltaY = 36;
            const labelElement = this.add.text(-125, -60 + index * deltaY, label, labelStyle).setOrigin(0);
            const valueElement = this.add.text(-125 + this.measureTextWidth(label, labelStyle)+10, -60 + index * deltaY, values[index].toString(), valueStyle).setOrigin(0);
            this.menuContainer.add([labelElement, valueElement]);
        });
    
        this.menuContainer.add(title);
    }
    
    // Helper function to measure the width of a given text and style
    private measureTextWidth(text: string, style: Phaser.Types.GameObjects.Text.TextStyle): number {
        const dummyText = this.add.text(0, 0, text, style);
        const width = dummyText.width;
        dummyText.destroy(); // We don't need to keep it after measuring
        return width;
    }
    

    private createNewGameButton(): void {
        this.newGameButton = new ButtonWithColorBackground(this, 0, 120, 'New Game', () => {
            // New game logic
        }, {
            color: 0x6CA4A8, 
            textColor: '#ffffff', 
            width: 250,
            height: 45,
            fontSize: '25px',
            fontStyle: "bold",
            parentContainer: this.menuContainer,
            cornerRadius : 6,
        });
        this.menuContainer.add(this.newGameButton);
    }

    private createCloseButton(): void {
        this.closeButton = this.add.image(120, -100, 'prompt_close').setOrigin(0.5).setInteractive({useHandCursor: true});
        this.closeButton.on('pointerdown', () => {
            this.scene.stop('WonScene');
        });
        this.menuContainer.add(this.closeButton);
    }

    private scaleMenuContainer(gameSize?: Phaser.Structs.Size): void {
        const { width, height } = gameSize || this.scale;
        this.menuContainer.setPosition(width / 2, height / 2);

        const scaleX = width / 800; // Example base width
        const scaleY = height / 800; // Example base height
        const scale = Math.min(scaleX, scaleY);

        this.menuContainer.setScale(scale);
        this.modalBackground.clear().fillRect(0, 0, width, height);
    }
}

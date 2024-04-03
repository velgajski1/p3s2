import Phaser from 'phaser';
import Button from '../utils/ButtonWithColorBackground';
import { RadioButtonSingle } from '../utils/RadioButtonSingle';
import { ItemCycleControl } from '../utils/ItemCycleControl';
import { BACKGROUND_COLORS} from '../misc/Consts';

export class Settings extends Phaser.Scene {
    private menuContainer!: Phaser.GameObjects.Container;
    private modalBackground!: Phaser.GameObjects.Graphics;
    private whiteBg!: Phaser.GameObjects.Graphics;

    constructor() {
        super('Settings');
    }

    create(): void {
        this.createModalBackground();
        this.createMenuContainer();
        this.createWhiteBackground();
        this.createTitle();
        this.createRadioButtons();
        this.createBackgroundSelector();
        this.createCancelButton();
        this.scaleMenuContainer();

        // Listen for resize events to dynamically adjust the layout
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
        this.whiteBg.fillRoundedRect(-250, -300, 500, 600, 20);
        this.menuContainer.add(this.whiteBg);
    }

    private createTitle(): void {
        const titleTxt = this.add.text(0, -280, "Settings", {
            fontFamily: 'Open Sans', fontSize: '40px', color: '#000000', align: 'center'
        }).setOrigin(0.5).setFontStyle("bold");
        this.menuContainer.add(titleTxt);
    }

    private createRadioButtons(): void {
        // Example positions and initial states are placeholders
        new RadioButtonSingle(this, -100, -150, 'Sound', true, {
            parentContainer: this.menuContainer,
            // Additional RadioButtonSingle configuration here
        });

        new RadioButtonSingle(this, -100, -100, 'Auto Finish', false, {
            parentContainer: this.menuContainer,
            // Additional RadioButtonSingle configuration here
        });

        new RadioButtonSingle(this, -100, -50, 'Right Handed', true, {
            parentContainer: this.menuContainer,
            // Additional RadioButtonSingle configuration here
        });
    }

    private createBackgroundSelector(): void {
      

        new ItemCycleControl(this, 0, 100, 'Background Color', BACKGROUND_COLORS, (selectedItem) => {
            
            const backgroundScene = this.scene.get('BackgroundScene') as any; // Use 'as any' if TypeScript complains about missing methods
            console.log(backgroundScene)
            console.log(selectedItem)
            // Now, call the method to change the background color
            if (backgroundScene) {
                backgroundScene.setToColor(selectedItem);
            }
        }, {
            parentContainer: this.menuContainer
        });
    }

    private createCancelButton(): void {
        new Button(this, 0, 250, 'Cancel', () => {
            this.scene.start('MainMenu');
        }, {
            color: 0x6CA4A8, 
            textColor: '#ffffff', 
            width: 320,
            height: 60,
            fontSize: '25px',
            fontStyle: "bold",
            parentContainer: this.menuContainer
        });
    }

    private scaleMenuContainer(gameSize?: Phaser.Structs.Size): void {
        const { width, height } = gameSize || this.scale;
        this.menuContainer.setPosition(width / 2, height / 2);
    
        const scaleX = width / 800; // Example base width
        const scaleY = height / 600; // Example base height
        const scale = Math.min(scaleX, scaleY);
    
        this.menuContainer.setScale(scale);
        this.modalBackground.clear().fillRect(0, 0, width, height);
    }
}

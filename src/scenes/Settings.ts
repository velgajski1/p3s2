import Phaser from 'phaser';
import Button from '../ui/ButtonWithColorBackground';
import { RadioButtonSingle } from '../ui/RadioButtonSingle';
import { ItemCycleControl } from '../ui/ItemCycleControl';
import { BACKGROUND_COLORS} from '../config/Consts';
import {LanguageConfig} from '../config/Language';
import { Language } from '../utils/Language';

export class Settings extends Phaser.Scene {
    private menuContainer!: Phaser.GameObjects.Container;
    private modalBackground!: Phaser.GameObjects.Graphics;
    private whiteBg!: Phaser.GameObjects.Graphics;
    prompt_close: Phaser.GameObjects.Image;

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
        this.createXButton();

        // Listen for resize events to dynamically adjust the layout
        this.scale.on('resize', this.scaleMenuContainer, this);
    }
    createXButton()
    {
        this.prompt_close = this.add.image(150, -180, 'prompt_close').setOrigin(0.5).setInteractive({useHandCursor: true});
        this.prompt_close.on('pointerdown', () => {
            this.scene.remove(this.scene.key);
        })
        this.menuContainer.add(this.prompt_close)
    }

    private createModalBackground(): void {
        this.modalBackground = this.add.graphics({ fillStyle: { color: 0x000000, alpha: 0.05 } });
        this.modalBackground.fillRect(0, 0, this.scale.width, this.scale.height);
    }

    private createMenuContainer(): void {
        this.menuContainer = this.add.container(this.scale.width / 2, this.scale.height / 2);
    }

    private createWhiteBackground(): void {
        this.whiteBg = this.add.graphics({ fillStyle: { color: 0xffffff, alpha: 1 } });
        this.whiteBg.fillRoundedRect(-180, -210, 360, 440, 12);
        this.menuContainer.add(this.whiteBg);
    }

    private createTitle(): void {
        const titleTxt = this.add.text(-150, -190, Language.getTranslation(LanguageConfig.GameSettings), {
            fontFamily: 'Open Sans', fontSize: '32px', color: '#000000', align: 'center'
        }).setOrigin(0).setFontStyle("bold");
        this.menuContainer.add(titleTxt);

        const titleTxt2 = this.add.text(-150, 40,  Language.getTranslation(LanguageConfig.VisualSettings), {
            fontFamily: 'Open Sans', fontSize: '32px', color: '#000000', align: 'center'
        }).setOrigin(0).setFontStyle("bold");
        this.menuContainer.add(titleTxt2);
    }

    private createRadioButtons(): void {
        // Example positions and initial states are placeholders
        new RadioButtonSingle(this, -130, -120,  Language.getTranslation(LanguageConfig.SoundOnOff), true, {
            parentContainer: this.menuContainer,
            // Additional RadioButtonSingle configuration here
        });

        new RadioButtonSingle(this, -130, -60,  Language.getTranslation(LanguageConfig.AutoFinish), false, {
            parentContainer: this.menuContainer,
            // Additional RadioButtonSingle configuration here
        });

        new RadioButtonSingle(this, -130, 0,  Language.getTranslation(LanguageConfig.RightHanded), true, {
            parentContainer: this.menuContainer,
            // Additional RadioButtonSingle configuration here
        });
    }

    private createBackgroundSelector(): void {
      

        new ItemCycleControl(this, -35, 110,  Language.getTranslation(LanguageConfig.Background), BACKGROUND_COLORS, (selectedItem) => {
            
            const backgroundScene = this.scene.get('BackgroundScene') as any; // Use 'as any' if TypeScript complains about missing methods
            console.log(backgroundScene)
            console.log(selectedItem)
            // Now, call the method to change the background color
            if (backgroundScene) {
                backgroundScene.setToColor(selectedItem);
            }
        }, {
            parentContainer: this.menuContainer,
            titleTextOptions : {
                color : "#000000",
                fontSize : '25px',
                fontFamily : 'Open Sans'
            }
        });
    }

    private createCancelButton(): void {
        new Button(this, 0, 180,  Language.getTranslation(LanguageConfig.SaveExit), () => {
            this.scene.remove('Settings');
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
    
        // Calculate scale based on a 1600x900 design, trying to fill as much as possible
        const scaleX = width / 600;
        const scaleY = height / 600;
        // Use the larger scale factor that maintains aspect ratio without exceeding screen dimensions
        const scale = Math.min(1, Math.max(scaleX, scaleY));
    
        // Check if scaling exceeds screen dimensions and adjust if necessary
        const effectiveWidth = 600 * scale;
        const effectiveHeight = 600 * scale;
        if (effectiveWidth > width || effectiveHeight > height) {
            // If the scaled size exceeds the screen size in either dimension, use the smaller scale factor
            this.menuContainer.setScale(Math.min(scaleX, scaleY));
        } else {
            // Otherwise, apply the calculated scale to maximize screen usage
            this.menuContainer.setScale(scale);
        }
    
        this.menuContainer.setScale(scale);
        this.modalBackground.clear().fillRect(0, 0, width, height);
    }
}

import Phaser from 'phaser';
import Button from '../ui/ButtonWithColorBackground';
import { translate } from '../utils/Language';
import { LanguageConfig } from '../config/Language';
import { GameManager } from '../managers/GameManager';
import { SOUND_ACTIVE, toggleThreeModeActive } from '../config/Config';
import { BaseMenuScene } from './BaseMenuScene';
import UndoManager from '../managers/UndoManager';
import { SoundManager } from '../managers/SoundManager';

export class MainMenu extends BaseMenuScene {
    private menuContainer!: Phaser.GameObjects.Container;
    whiteBg: Phaser.GameObjects.Graphics;
    titleTxt: Phaser.GameObjects.Text;
    cancelButton: Button;
    prompt_close: Phaser.GameObjects.Image;

    constructor() {
        super('MainMenu');
    }

    create(): void {
        super.create();

        // Create a container centered in the game
        this.menuContainer = this.add.container(this.scale.width / 2, this.scale.height / 2);

        this.whiteBg = this.add.graphics({ fillStyle: { color: 0xffffff, alpha: 1 } });
        this.whiteBg.fillRoundedRect(-200, -250, 400, 500, 12);
        // Add the modal background to the container
        this.menuContainer.add(this.whiteBg);

        this.titleTxt = this.add.text(0, -200, translate(LanguageConfig.Menu), {
            fontFamily: 'Open Sans',
            fontSize: '32px',
            color: '#000000',
            align: 'left'
        }).setOrigin(0.5);
        this.titleTxt.setFontStyle("bold");
        this.menuContainer.add(this.titleTxt);

        this.prompt_close = this.add.image(170, -220, 'prompt_close').setOrigin(0.5).setInteractive({ useHandCursor: true });
        this.prompt_close.on('pointerdown', () => {
            this.remove();
        });
        this.menuContainer.add(this.prompt_close);

        // Menu text options
        const menuItems = [
            translate(LanguageConfig.RestartGame),
            translate(LanguageConfig.NewGameTurn1),
            translate(LanguageConfig.NewGameTurn3),
            translate(LanguageConfig.HowToPlaySolitaire),
            translate(LanguageConfig.Statistics),
            translate(LanguageConfig.AllGames)
        ];

        const menuActions = [
            this.restartThisGame,
            this.newGame1,
            this.newGame3,
            this.howToPlay,
            this.statistics,
            this.allGames,
        ];

        // Add menu items to the container
        menuItems.forEach((item, index) => {
            const menuItem = this.add.text(-150, (index - 3) * 50, item, {
                fontFamily: 'Open Sans',
                fontSize: '25px',
                color: '#000000',
                align: 'left'
            }).setOrigin(0).setInteractive({ useHandCursor: true });

            const underline = this.add.graphics();
            underline.lineStyle(2, 0x000000, 1);
            underline.moveTo(-150, (index - 3) * 50 + 30); // Adjust position as needed
            underline.lineTo(-150+menuItem.width, (index - 3) * 50 + 30); // Adjust width as needed
            underline.strokePath();
            underline.setVisible(false);


            menuItem.on('pointerdown', () => {
                menuActions[index]();
                SOUND_ACTIVE && SoundManager.instance.click.play()
            });

            menuItem.on('pointerover', () => {
                underline.setVisible(true);
            });

            menuItem.on('pointerout', () => {
                underline.setVisible(false);
            });

            this.menuContainer.add(menuItem);
            this.menuContainer.add(underline);
        });

        this.cancelButton = new Button(this, 0, 180, translate(LanguageConfig.Cancel), () => {
            this.remove();
        }, {
            color: 0x6CA4A8,
            textColor: '#ffffff',
            width: 320,
            height: 60,
            fontSize: '25px',
            fontStyle: "bold",
            parentContainer: this.menuContainer
        });

        // Scale the container
        this.scaleMenuContainer();

        // Listen for resize events to dynamically adjust the container
        this.scale.on('resize', this.scaleMenuContainer, this);

        // Set the initial position and scale
        this.scaleMenuContainer();
    }

    private scaleMenuContainer(gameSize?: Phaser.Structs.Size): void {
        // Use provided gameSize or current game size
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
    }

    restartThisGame = () => {
        const state = UndoManager.getInstance().undoFully();
        const gManager = this.registry.get('gameManager');
        // const state = undoManager.undo(); // Assuming you have an UndoManager implemented as a singleton
        if (state) {
            gManager.pileManager.setToGameState(state);
        }
        this.remove();
    }

    newGame1 = () => {
        toggleThreeModeActive(false);
        this.restartGame();
    }

    newGame3 = () => {
        toggleThreeModeActive(true);
        this.restartGame();
    }

    howToPlay = () => {
        // Add logic for how to play
    }

    statistics = () => {
        this.remove();
        setTimeout(() => {
            this.scene.launch("Statistics").bringToTop("Statistics");
        }, 500);
    }

    allGames = () => {
        // Add logic for all games
    }
}

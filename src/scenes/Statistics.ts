import Phaser from 'phaser';
import Button from '../ui/ButtonWithColorBackground';
import { STAT_LABELS } from '../config/Consts';
import { Language } from '../utils/Language';
import { LanguageConfig } from '../config/Language';

export class Statistics extends Phaser.Scene {
    private menuContainer!: Phaser.GameObjects.Container;
    private modalBackground!: Phaser.GameObjects.Graphics;
    private whiteBg!: Phaser.GameObjects.Graphics;
    private titleTxt!: Phaser.GameObjects.Text;
    private closeButton: Button;
    private resetButton: Button;
   

    constructor() {
        super({ key: 'Statistics' });
    }

    create(): void {
        this.createModalBackground();
        this.createMenuContainer();
        this.createWhiteBackground();
        this.createTitleText();
        this.createStatsTextItems();
        this.createButtons();
        this.scaleMenuContainer();

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
        this.whiteBg.fillRoundedRect(-200, -250, 400, 500, 20);
        this.menuContainer.add(this.whiteBg);
    }

    private createTitleText(): void {
        this.titleTxt = this.add.text(0, -220, Language.getTranslation(LanguageConfig.Statistics), {
            fontFamily: 'Open Sans',
            fontSize: '36px',
            color: '#000000',
            align: 'center'
        }).setOrigin(0.5).setFontStyle('bold');
        this.menuContainer.add(this.titleTxt);
    }



    private createStatsTextItems(): void {
        localStorage.getItem("")
        const statsData = [
            { lang:LanguageConfig.GamesPlayed, label: STAT_LABELS.GamesPlayed, value: 0 },
            { lang:LanguageConfig.GamesWon, label: STAT_LABELS.GamesWon, value: 0 },
            { lang:LanguageConfig.WinPercentage, label: STAT_LABELS.WinPercentage, value: 0 },
            { lang:LanguageConfig.CurrentWinStreak, label: STAT_LABELS.CurrentWinStreak, value: 0 },
            { lang:LanguageConfig.LongestWinStreak, label: STAT_LABELS.LongestWinStreak, value: 0 },
            { lang:LanguageConfig.TopScore, label: STAT_LABELS.TopScore, value: 0 },
            { lang:LanguageConfig.BestTime, label: STAT_LABELS.BestTime, value: 0 },
        ];


        statsData.forEach(element => {
            const value = localStorage.getItem(element.label);
            element.value = parseInt(value !== null ? value : '0');
            element.label = Language.getTranslation(element.lang);

        });
        

        let offsetY = -180;
        const labelStyle = { fontFamily: 'Arial', fontSize: '24px', color: '#000' };
        const valueStyle = { ...labelStyle, fontStyle: 'bold' };

        statsData.forEach(stat => {
            const label = this.add.text(-150, offsetY, `${stat.label}: `, labelStyle).setOrigin(0);
            const value = this.add.text(-150 + label.width, offsetY, `${stat.value}`, valueStyle).setOrigin(0);
            this.menuContainer.add([label, value]);
            offsetY += 50; // Adjust vertical spacing as needed
        });
    }

    private createButtons(): void {
        this.closeButton = new Button(this, -100, 200, Language.getTranslation(LanguageConfig.Close), () => {
            this.scene.stop('Statistics');
        }, {
            color: 0x4C6A92,
            textColor: '#FFFFFF',
            width: 150,
            height: 50,
            fontSize: '24px',
            fontStyle: 'bold',
            parentContainer: this.menuContainer
        });

        this.resetButton = new Button(this, 100, 200, Language.getTranslation(LanguageConfig.ResetStats), () => {
            // Add logic to reset stats here
            
        }, {
            color: 0x4C6A92,
            textColor: '#FFFFFF',
            width: 150,
            height: 50,
            fontSize: '24px',
            fontStyle: 'bold',
            parentContainer: this.menuContainer
        });
    }

    private scaleMenuContainer(gameSize?: Phaser.Structs.Size): void {
        const { width, height } = gameSize || this.scale.gameSize;
        this.menuContainer.setPosition(width / 2, height / 2);

        const scaleX = width / 800; // Example base width
        const scaleY = height / 600; // Example base height
        const scale = Math.min(scaleX, scaleY);

        this.menuContainer.setScale(scale);
        this.modalBackground.clear().fillRect(0, 0, width, height);
    }

    // Other necessary methods like on resize...
}

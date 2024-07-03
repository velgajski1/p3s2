import Phaser from 'phaser';
import Button, { ButtonWithColorBackground } from '../ui/ButtonWithColorBackground';
import { STAT_LABELS } from '../config/Consts';
import { Language } from '../utils/Language';
import { LanguageConfig } from '../config/Language';
import { BaseMenuScene } from './BaseMenuScene';
import statsManager from '../managers/StatsManager';

export class Statistics extends BaseMenuScene {
    private menuContainer!: Phaser.GameObjects.Container;
    private whiteBg!: Phaser.GameObjects.Graphics;
    private titleTxt!: Phaser.GameObjects.Text;
    private closeButton: Button;
    private resetButton: Button;

    constructor() {
        super('Statistics');
    }

    create(): void {
        super.create();
        this.createMenuContainer();
        this.createWhiteBackground();
        this.createTitleText();
        this.createStatsTextItems();
        this.createButtons();
        this.scaleMenuContainer();

        this.scale.on('resize', this.scaleMenuContainer, this);
    }

    private createMenuContainer(): void {
        this.menuContainer = this.add.container(this.scale.width / 2, this.scale.height / 2);
    }

    private createWhiteBackground(): void {
        this.whiteBg = this.add.graphics({ fillStyle: { color: 0xffffff, alpha: 1 } });
        this.whiteBg.fillRoundedRect(-150, -200, 300, 400, 8);
        this.menuContainer.add(this.whiteBg);
    }

    private createTitleText(): void {
        this.titleTxt = this.add.text(-130, -190, Language.getTranslation(LanguageConfig.Statistics), {
            fontFamily: 'Open Sans',
            fontSize: '30px',
            color: '#000000',
            align: 'left',
            fontStyle: 'bold'
        }).setOrigin(0);
        this.menuContainer.add(this.titleTxt);
    }

    private createStatsTextItems(): void {
        const statsData = [
            { lang: LanguageConfig.GamesPlayed, label: STAT_LABELS.GamesPlayed, value: statsManager.gamesPlayed },
            { lang: LanguageConfig.GamesWon, label: STAT_LABELS.GamesWon, value: statsManager.gamesWon },
            { lang: LanguageConfig.WinPercentage, label: STAT_LABELS.WinPercentage, value: statsManager.winPercentage + "%" },
            { lang: LanguageConfig.CurrentWinStreak, label: STAT_LABELS.CurrentWinStreak, value: statsManager.currentWinStreak },
            { lang: LanguageConfig.LongestWinStreak, label: STAT_LABELS.LongestWinStreak, value: statsManager.longestWinStreak },
            { lang: LanguageConfig.TopScore, label: STAT_LABELS.TopScore, value: statsManager.topScore },
            { lang: LanguageConfig.BestTime, label: STAT_LABELS.BestTime, value: statsManager._formatTime(statsManager.bestTime) },
        ];

        statsData.forEach(element => {
            const value = localStorage.getItem(element.label);
            // element.value = parseInt(value !== null ? value : '0');
            element.label = Language.getTranslation(element.lang);
        });

        let offsetY = -140;
        const labelStyle = { fontFamily: 'Open Sans', fontSize: '20px', color: '#000000' };
        const valueStyle = { ...labelStyle, fontStyle: 'bold' };

        statsData.forEach(stat => {
            const label = this.add.text(-130, offsetY, `${stat.label}: `, labelStyle).setOrigin(0);
            const value = this.add.text(-130 + this.measureTextWidth(stat.label, labelStyle) + 40, offsetY, `${stat.value}`, valueStyle).setOrigin(0);
            this.menuContainer.add([label, value]);
            offsetY += 33; // Adjust vertical spacing as needed
        });
    }

    private measureTextWidth(text: string, style: Phaser.Types.GameObjects.Text.TextStyle): number {
        const dummyText = this.add.text(0, 0, text, style);
        const width = dummyText.width;
        dummyText.destroy(); // We don't need to keep it after measuring
        return width;
    }

    private createButtons(): void {
        this.closeButton = new ButtonWithColorBackground(this, 0, 120, Language.getTranslation(LanguageConfig.Close), () => {
            this.scene.stop('Statistics');
        }, {
            color: 0x6CA4A8, 
            textColor: '#ffffff', 
            width: 250,
            height: 40,
            fontSize: '22px',
            fontStyle: "bold",
            parentContainer: this.menuContainer,
            cornerRadius : 6,
        });

        this.resetButton = new ButtonWithColorBackground(this, 0, 170, Language.getTranslation(LanguageConfig.ResetStats), () => {
            statsManager.resetStats()
            this.scene.restart()
        }, {
            color: 0x6CA4A8, 
            textColor: '#ffffff', 
            width: 250,
            height: 40,
            fontSize: '22px',
            fontStyle: "bold",
            parentContainer: this.menuContainer,
            cornerRadius : 6,
        });
    }

    // private scaleMenuContainer(gameSize?: Phaser.Structs.Size): void {
    //     const { width, height } = gameSize || this.scale;
    //     this.menuContainer.setPosition(width / 2, height / 2);

    //     const scaleX = width / 800; // Example base width
    //     const scaleY = height / 800; // Example base height
    //     const scale = Math.min(scaleX, scaleY);

    //     this.menuContainer.setScale(scale);
    //     this.modalBackground.clear().fillRect(0, 0, width, height);
    // }

    private scaleMenuContainer(gameSize?: Phaser.Structs.Size): void {
        // Use provided gameSize or current game size
        // 
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
}

// Export the class if needed
export default Statistics;

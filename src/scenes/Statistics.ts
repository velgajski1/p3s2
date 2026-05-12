import Phaser from 'phaser';
import { ButtonWithColorBackground } from '../ui/ButtonWithColorBackground';
import { Language, translate } from '../utils/Language';
import { LanguageConfig } from '../config/Language';
import { BaseMenuScene } from './BaseMenuScene';
import statsManager from '../managers/StatsManager';
import { STOCK_THREE_MODE_ACTIVE } from '../config/Config';

export class Statistics extends BaseMenuScene {
    private menuContainer!: Phaser.GameObjects.Container;
    private whiteBg!: Phaser.GameObjects.Graphics;
    private titleTxt!: Phaser.GameObjects.Text;
    private resetButton: ButtonWithColorBackground;
    prompt_close: Phaser.GameObjects.Image;

    constructor() {
        super('Statistics');
    }

    create(): void {
        statsManager.loadStats(true);
        super.create();
        this.createMenuContainer();
        this.createWhiteBackground();
        this.createTitleText();
        this.createSections();
        this.createResetButton();
        this.createXButton();
        this.scaleMenuContainer();

        this.scale.on('resize', this.scaleMenuContainer, this);
    }

    private createMenuContainer(): void {
        this.menuContainer = this.add.container(this.scale.width / 2, this.scale.height / 2);
    }

    private createWhiteBackground(): void {
        // 400 wide x 410 tall, top-left at (-200, -200)
        this.whiteBg = this.add.graphics({ fillStyle: { color: 0xffffff, alpha: 1 } });
        this.whiteBg.fillRoundedRect(-200, -200, 400, 410, 8);
        this.menuContainer.add(this.whiteBg);
    }

    private createTitleText(): void {
        const statTitle = STOCK_THREE_MODE_ACTIVE
            ? translate(LanguageConfig.Stats3)
            : translate(LanguageConfig.Stats1);
        this.titleTxt = this.add.text(-170, -178, statTitle, {
            fontFamily: 'Open Sans',
            fontSize: '24px',
            color: '#000000',
            align: 'center',
            fontStyle: 'bold',
        }).setOrigin(0, 0);
        this.menuContainer.add(this.titleTxt);
    }

    private createXButton(): void {
        this.prompt_close = this.add.image(170, -170, 'prompt_close').setOrigin(0.5).setInteractive({ useHandCursor: true });
        this.prompt_close.on('pointerdown', () => this.remove());
        this.menuContainer.add(this.prompt_close);
    }

    private createSections(): void {
        const labelX = -170;
        const valueX = 170;
        const sectionStyle: Phaser.Types.GameObjects.Text.TextStyle = {
            fontFamily: 'Open Sans', fontSize: '20px', color: '#000000', fontStyle: 'bold',
        };
        const rowStyle: Phaser.Types.GameObjects.Text.TextStyle = {
            fontFamily: 'Open Sans', fontSize: '18px', color: '#000000',
        };
        const valueStyle: Phaser.Types.GameObjects.Text.TextStyle = { ...rowStyle };

        const spielen = this.add.text(labelX, -135, Language.getTranslation(LanguageConfig.Spielen), sectionStyle).setOrigin(0, 0);
        this.menuContainer.add(spielen);

        const spielenRows = [
            { label: LanguageConfig.GamesPlayed, value: '' + statsManager.gamesPlayed },
            { label: LanguageConfig.GamesWon, value: '' + statsManager.gamesWon },
            { label: LanguageConfig.WinPercentage, value: statsManager.winPercentage + '%' },
        ];

        let y = -105;
        spielenRows.forEach(r => {
            const labelTxt = this.add.text(labelX, y, Language.getTranslation(r.label), rowStyle).setOrigin(0, 0);
            const valueTxt = this.add.text(valueX, y, r.value, valueStyle).setOrigin(1, 0);
            this.menuContainer.add([labelTxt, valueTxt]);
            y += 28;
        });

        const leistung = this.add.text(labelX, y + 8, Language.getTranslation(LanguageConfig.Leistung), sectionStyle).setOrigin(0, 0);
        this.menuContainer.add(leistung);
        y += 38;

        const leistungRows = [
            { label: LanguageConfig.TopScore, value: '' + statsManager.topScore },
            { label: LanguageConfig.BestTime, value: statsManager._formatTime(statsManager.bestTime) },
        ];
        leistungRows.forEach(r => {
            const labelTxt = this.add.text(labelX, y, Language.getTranslation(r.label), rowStyle).setOrigin(0, 0);
            const valueTxt = this.add.text(valueX, y, r.value, valueStyle).setOrigin(1, 0);
            this.menuContainer.add([labelTxt, valueTxt]);
            y += 28;
        });
    }

    private createResetButton(): void {
        this.resetButton = new ButtonWithColorBackground(this, 0, 165, Language.getTranslation(LanguageConfig.ResetStats), () => {
            statsManager.resetStats();
            this.scene.restart();
        }, {
            color: 0x568234,
            textColor: '#ffffff',
            width: 320,
            height: 44,
            fontSize: '20px',
            fontStyle: 'bold',
            parentContainer: this.menuContainer,
        });
    }

    private scaleMenuContainer(gameSize?: Phaser.Structs.Size): void {
        const { width, height } = gameSize || this.scale;
        this.menuContainer.setPosition(width / 2, height / 2);

        const scaleX = width / 600;
        const scaleY = height / 600;
        const scale = Math.min(1, Math.max(scaleX, scaleY));

        const effectiveWidth = 600 * scale;
        const effectiveHeight = 600 * scale;
        if (effectiveWidth > width || effectiveHeight > height) {
            this.menuContainer.setScale(Math.min(scaleX, scaleY));
        } else {
            this.menuContainer.setScale(scale);
        }
    }
}

export default Statistics;

import Phaser from 'phaser';
import ButtonWithColorBackground from '../ui/ButtonWithColorBackground';
import { formatTime } from '../utils/Utils';
import { translate } from '../utils/Language';
import { LanguageConfig } from '../config/Language';
import { BaseMenuScene } from './BaseMenuScene';
import statsManager from '../managers/StatsManager';
import { SoundManager } from '../managers/SoundManager';
import { SOUND_ACTIVE } from '../config/Config';

const WIN_TITLES_DE = [
    'Spiel gewonnen!',
    'Sehr gut gespielt!',
    'Prima gemacht!',
    'Gut gemacht!',
    'Schön gelöst!',
    'Klasse gespielt!',
    'Runde gewonnen!',
    'Geschafft!',
    'Sie haben gewonnen!',
    'Das war gut!',
    'Toll gespielt!',
    'Sehr schön!',
    'Glückwunsch!',
    'Erfolgreich beendet!',
];

export class WonScene extends BaseMenuScene {
    private menuContainer!: Phaser.GameObjects.Container;
    private whiteBg!: Phaser.GameObjects.Graphics;
    private newGameButton!: ButtonWithColorBackground;
    private titleText: string = WIN_TITLES_DE[0];

    constructor(public score: number = 0, public timePlayed: number = 0, public timeBonus: number = 0, public totalScore: number = 0) {
        super('WonScene');
    }

    init(data: any) {
        this.score = data.score;
        this.timePlayed = data.timeplayed;
        this.timeBonus = data.timebonus;
        this.totalScore = data.totalscore;
        this.titleText = WIN_TITLES_DE[Math.floor(Math.random() * WIN_TITLES_DE.length)];
    }

    create(): void {
        super.create();
        this.createMenuContainer();
        this.createWhiteBackground();
        this.createTextElements();
        this.createNewGameButton();
        this.scaleMenuContainer();

        this.scale.on('resize', this.scaleMenuContainer, this);
        statsManager.updateStatsAfterGame(true, this.totalScore, this.timePlayed);
        SOUND_ACTIVE && SoundManager.instance.won.play();
    }

    private createMenuContainer(): void {
        this.menuContainer = this.add.container(this.scale.width / 2, this.scale.height / 2);
    }

    private createWhiteBackground(): void {
        this.whiteBg = this.add.graphics({ fillStyle: { color: 0xffffff, alpha: 1 } });
        this.whiteBg.fillRoundedRect(-200, -160, 400, 320, 8);
        this.menuContainer.add(this.whiteBg);
    }

    private createTextElements(): void {
        const title = this.add.text(0, -130, this.titleText, {
            fontFamily: 'Open Sans',
            fontSize: '26px',
            color: '#568234',
            align: 'center',
            fontStyle: 'bold',
        }).setOrigin(0.5, 0);
        this.menuContainer.add(title);

        const rows = [
            { label: translate(LanguageConfig.Score), value: '' + this.score, bold: false },
            { label: translate(LanguageConfig.TimePlayed), value: formatTime(this.timePlayed, 'hh:mm:ss'), bold: false },
            { label: translate(LanguageConfig.TimeBonus), value: '' + this.timeBonus, bold: false },
            { label: translate(LanguageConfig.TotalScore), value: '' + this.totalScore, bold: true },
        ];

        const labelX = -170;
        const valueX = 170;
        let y = -70;

        rows.forEach(r => {
            const labelStyle: Phaser.Types.GameObjects.Text.TextStyle = {
                fontFamily: 'Open Sans',
                fontSize: r.bold ? '22px' : '20px',
                color: '#000000',
                fontStyle: r.bold ? 'bold' : 'normal',
            };
            const valueStyle: Phaser.Types.GameObjects.Text.TextStyle = {
                ...labelStyle,
                fontStyle: 'bold',
            };
            const labelEl = this.add.text(labelX, y, r.label, labelStyle).setOrigin(0, 0);
            const valueEl = this.add.text(valueX, y, r.value, valueStyle).setOrigin(1, 0);
            this.menuContainer.add([labelEl, valueEl]);
            y += r.bold ? 36 : 32;
        });
    }

    private createNewGameButton(): void {
        this.newGameButton = new ButtonWithColorBackground(this, 0, 115, translate(LanguageConfig.NewGame), () => {
            this.restartGame(true);
        }, {
            color: 0x568234,
            textColor: '#ffffff',
            width: 320,
            height: 44,
            fontSize: '20px',
            fontStyle: 'bold',
            parentContainer: this.menuContainer,
        });
        this.menuContainer.add(this.newGameButton);
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

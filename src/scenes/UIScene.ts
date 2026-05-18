import Phaser, { GameObjects } from 'phaser';
import { LanguageConfig } from '../config/Language';
import { GameManager } from '../managers/GameManager';
import { translate } from '../utils/Language';
import { formatTime } from '../utils/Utils';
import ToggleSwitch from '../ui/ToggleSwitch';
import Registry from '../config/Registry';
import ImageButton from '../ui/ImageButton';
import ButtonWithColorBackground from '../ui/ButtonWithColorBackground';
import { DRAG_ACTIVE, NIGHT_MODE_ACTIVE, STOCK_THREE_MODE_ACTIVE, toggleNightModeActive, toggleThreeModeActive } from '../config/Config';
import HintManager from '../managers/HintManager';
import { getActiveTopbarOwnerId, topbarDebugLog } from '../utils/Debug';

export class UIScene extends Phaser.Scene {
    textContainer: Phaser.GameObjects.Container;
    private scoreText: Phaser.GameObjects.Text;
    private timeText: Phaser.GameObjects.Text;
    private gameManager: GameManager; // Reference to the GameManager
    movesText: Phaser.GameObjects.Text;
    elementsContainer: Phaser.GameObjects.Container;
    elementsContainer2: GameObjects.Container;
    elementsContainer3: GameObjects.Container;
    inputEnabled: boolean = true;
    skipClicks: boolean = false;

    private htmlScore: HTMLElement | null = null;
    private htmlTime: HTMLElement | null = null;
    private topbarDebugLastSnapshot = '';
    private topbarDebugLastLogTime = 0;

    desktopUI: {
        toggle: ToggleSwitch;
        neustart: ButtonWithColorBackground;
        settings: ImageButton;
        help: ImageButton;
        stats: ImageButton;
        night: ImageButton;
        hint: ImageButton;
        undo: ImageButton;
    };
    mobileUI: {
        toggle: ToggleSwitch;
        neustart: ButtonWithColorBackground;
        settings: ImageButton;
        help: ImageButton;
        stats: ImageButton;
        night: ImageButton;
        hint: ImageButton;
        undo: ImageButton;
    };


    static myRef : UIScene;

    constructor() {
        super('UIScene');
        UIScene.myRef = this;
    }



    create(): void {
        // Create UI elements here
        this.textContainer = this.add.container(0, 0);
        this.elementsContainer = this.add.container(0, 0);
        this.elementsContainer2 = this.add.container(0, 0);
        this.elementsContainer3 = this.add.container(0, 0);
        this.createTextElements();
        this.textContainer.setVisible(false);
        this.htmlScore = document.querySelector('.stat-score');
        this.htmlTime = document.querySelector('.stat-time');
        topbarDebugLog('UIScene.create', {
            hasHtmlScore: !!this.htmlScore,
            hasHtmlTime: !!this.htmlTime,
            scoreTextContent: this.htmlScore?.textContent || '',
            timeTextContent: this.htmlTime?.textContent || '',
        });
        this.createUIElements()
        this.createUIElementsMobile()
        this.gameManager = this.registry.get('gameManager');


        this.scale.on('resize', this.resize, this);
        this.resize(this.scale.gameSize as unknown as Phaser.Structs.Size);
    }
    createUIElements()
    {
        this.desktopUI = {} as any;

        // Centered horizontal toolbar. Order left→right: undo, hint, 1-card, 3-card, night, stats, help, settings.
        // 15px gap between all neighbors EXCEPT 1-card and 3-card which are flush (0 gap). Total span 966 → ±483.
        this.desktopUI.undo = new ImageButton(this, -483, 0, 'btn-undo', 'btn-undo-hover', () => {
            if (!this.inputEnabled || this.skipClicks) return;
            this.gameManager = this.registry.get("gameManager");
            this.gameManager.controlManager.handleUKey();
        });
        this.desktopUI.undo.skipClickSound = true;
        this.desktopUI.undo.setOrigin(0, 0);
        this.elementsContainer.add(this.desktopUI.undo);

        this.desktopUI.hint = new ImageButton(this, -248, 0, 'btn-hint', 'btn-hint-hover', () => {
            if (!this.inputEnabled || this.skipClicks) return;
            const gamemanager: GameManager = this.registry.get('gameManager');
            HintManager.getInstance().getHint(gamemanager.pileManager);
        });
        this.desktopUI.hint.skipClickSound = true;
        this.desktopUI.hint.setOrigin(0, 0);
        this.elementsContainer.add(this.desktopUI.hint);

        this.desktopUI.toggle = new ToggleSwitch(
            this,
            -13,
            0,
            'btn-1-card-off',
            'btn-1-card-on',
            'btn-3-card-off',
            'btn-3-card-on',
            110,
            0,
            (nextState: boolean) => {
                if (!this.inputEnabled || this.skipClicks) return;
                const gamemanager: GameManager = this.registry.get("gameManager");
                gamemanager.updateStats();
                toggleThreeModeActive(nextState);
                gamemanager.restart();
            },
            STOCK_THREE_MODE_ACTIVE
        );
        this.elementsContainer.add(this.desktopUI.toggle);

        // NEUSTART occupies the same slot as the 1/3 toggle; visibility-swapped while a modal is open.
        this.desktopUI.neustart = new ButtonWithColorBackground(this, 97, 27, '↺ ' + translate(LanguageConfig.Neustart), () => {
            if (!this.inputEnabled || this.skipClicks) return;
            const gm: GameManager = this.registry.get('gameManager');
            gm.updateStats();
            gm.restart();
        }, {
            color: 0x568234,
            textColor: '#ffffff',
            width: 220,
            height: 54,
            fontSize: '20px',
            fontStyle: 'bold',
            cornerRadius: 8,
            parentContainer: this.elementsContainer,
        });
        this.desktopUI.neustart.setVisible(false);

        this.desktopUI.night = new ImageButton(this, 222, 0, 'icon-night', 'icon-night-hover', () => {
            if (!this.inputEnabled || this.skipClicks) return;
            this.toggleNightMode();
        });
        this.desktopUI.night.setOrigin(0, 0);
        this.elementsContainer.add(this.desktopUI.night);

        this.desktopUI.stats = new ImageButton(this, 291, 0, 'icon-stats', 'icon-stats-hover', () => {
            if (!this.inputEnabled || this.skipClicks) return;
            this.scene.launch("Statistics").bringToTop("Statistics");
        });
        this.desktopUI.stats.setOrigin(0, 0);
        this.elementsContainer.add(this.desktopUI.stats);

        this.desktopUI.help = new ImageButton(this, 360, 0, 'icon-help', 'icon-help-hover', () => {
            if (!this.inputEnabled || this.skipClicks) return;
            const url = '/howtoplay';
            const w = window.open(url, '_blank');
            if (!w) window.location.href = url;
        });
        this.desktopUI.help.setOrigin(0, 0);
        this.elementsContainer.add(this.desktopUI.help);

        this.desktopUI.settings = new ImageButton(this, 429, 0, 'icon-settings', 'icon-settings-hover', () => {
            if (!this.inputEnabled || this.skipClicks) return;
            this.scene.launch("Settings").bringToTop("Settings");
            this.input.setDefaultCursor('default');
        });
        this.desktopUI.settings.setDepth(50000);
        this.desktopUI.settings.setOrigin(0, 0);
        this.elementsContainer.add(this.desktopUI.settings);
    }

    createUIElementsMobile() {
        this.mobileUI = {} as any;
        const colRightX = -80;
        const colLeftX = 20;

        // ec2: right cluster (toggle + hint + undo) using mobile-* art
        this.mobileUI.toggle = new ToggleSwitch(
            this,
            colRightX,
            0,
            'mobile-btn-1-card-off',
            'mobile-btn-1-card-on',
            'mobile-btn-3-card-off',
            'mobile-btn-3-card-on',
            0,
            55,
            (nextState: boolean) => {
                if (!this.inputEnabled || this.skipClicks) return;
                const gamemanager: GameManager = this.registry.get("gameManager");
                gamemanager.updateStats();
                toggleThreeModeActive(nextState);
                gamemanager.restart();
            },
            STOCK_THREE_MODE_ACTIVE
        );
        this.elementsContainer2.add(this.mobileUI.toggle);

        // Mobile NEUSTART overlays the toggle position (visibility-swapped when a modal is open)
        this.mobileUI.neustart = new ButtonWithColorBackground(this, colRightX + 27, 55, '↺', () => {
            if (!this.inputEnabled || this.skipClicks) return;
            const gm: GameManager = this.registry.get('gameManager');
            gm.updateStats();
            gm.restart();
        }, {
            color: 0x568234,
            textColor: '#ffffff',
            width: 54,
            height: 110,
            fontSize: '28px',
            fontStyle: 'bold',
            cornerRadius: 8,
            parentContainer: this.elementsContainer2,
        });
        this.mobileUI.neustart.setVisible(false);

        this.mobileUI.hint = new ImageButton(this, colRightX, 164, 'mobile-btn-hint', 'mobile-btn-hint', () => {
            if (!this.inputEnabled || this.skipClicks) return;
            const gamemanager: GameManager = this.registry.get('gameManager');
            HintManager.getInstance().getHint(gamemanager.pileManager);
        });
        this.mobileUI.hint.skipClickSound = true;
        this.mobileUI.hint.setOrigin(0, 0);
        this.elementsContainer2.add(this.mobileUI.hint);

        this.mobileUI.undo = new ImageButton(this, colRightX, 219, 'mobile-btn-undo', 'mobile-btn-undo', () => {
            if (!this.inputEnabled || this.skipClicks) return;
            this.gameManager = this.registry.get("gameManager");
            this.gameManager.controlManager.handleUKey();
        });
        this.mobileUI.undo.skipClickSound = true;
        this.mobileUI.undo.setOrigin(0, 0);
        this.elementsContainer2.add(this.mobileUI.undo);

        // ec3: left cluster (settings/help/stats/night) using icon-* art
        this.mobileUI.settings = new ImageButton(this, colLeftX, 0, 'icon-settings', 'icon-settings-hover', () => {
            if (!this.inputEnabled || this.skipClicks) return;
            this.scene.launch("Settings").bringToTop("Settings");
            this.input.setDefaultCursor('default');
        });
        this.mobileUI.settings.setDepth(50000);
        this.mobileUI.settings.setOrigin(0, 0);
        this.elementsContainer3.add(this.mobileUI.settings);

        this.mobileUI.help = new ImageButton(this, colLeftX, 55, 'icon-help', 'icon-help-hover', () => {
            if (!this.inputEnabled || this.skipClicks) return;
            const url = '/howtoplay';
            const w = window.open(url, '_blank');
            if (!w) window.location.href = url;
        });
        this.mobileUI.help.setOrigin(0, 0);
        this.elementsContainer3.add(this.mobileUI.help);

        this.mobileUI.stats = new ImageButton(this, colLeftX, 110, 'icon-stats', 'icon-stats-hover', () => {
            if (!this.inputEnabled || this.skipClicks) return;
            this.scene.launch("Statistics").bringToTop("Statistics");
        });
        this.mobileUI.stats.setOrigin(0, 0);
        this.elementsContainer3.add(this.mobileUI.stats);

        this.mobileUI.night = new ImageButton(this, colLeftX, 165, 'icon-night', 'icon-night-hover', () => {
            if (!this.inputEnabled || this.skipClicks) return;
            this.toggleNightMode();
        });
        this.mobileUI.night.setOrigin(0, 0);
        this.elementsContainer3.add(this.mobileUI.night);

        this.elementsContainer2.visible = this.elementsContainer3.visible = false;
    }

    update(time: number): void
    {
        this.elementsContainer3.visible = this.elementsContainer2.visible
        this.elementsContainer3.setScale(this.elementsContainer2.scale)

        const currentGameManager = this.registry.get('gameManager') as GameManager | undefined;
        if (currentGameManager) {
            this.gameManager = currentGameManager;
        }
        if (!this.gameManager) return;

        const scoreStr = translate(LanguageConfig.Score) + this.gameManager.getCurrentScore();
        const timeStr = formatTime(this.gameManager.getElapsedTime());
        this.scoreText.text = scoreStr;
        this.timeText.text = ' | ' + timeStr;
        this.movesText.text = '';
        if (!this.htmlScore || !this.htmlScore.isConnected) this.htmlScore = document.querySelector('.stat-score');
        if (!this.htmlTime || !this.htmlTime.isConnected) this.htmlTime = document.querySelector('.stat-time');
        const canWriteTopbar = this.gameManager.canWriteTopbar();
        if (canWriteTopbar) {
            if (this.htmlScore) this.htmlScore.textContent = scoreStr;
            if (this.htmlTime) this.htmlTime.textContent = '| ' + timeStr;
        }
        this.logTopbarDebug(time, scoreStr, timeStr, canWriteTopbar, currentGameManager);
        this.updateTextPos()

        this.inputEnabled = true

        const modalOpen = this.scene.isActive('Settings') || this.scene.isActive('Statistics') || this.scene.isActive('WonScene');
        if (modalOpen) this.inputEnabled = false;

        const ui = this.elementsContainer.visible ? this.desktopUI : this.mobileUI;
        const buttons: ImageButton[] = [ui.settings, ui.help, ui.stats, ui.night, ui.hint, ui.undo];
        if (DRAG_ACTIVE) {
            buttons.forEach(b => b.disableInteractive());
            ui.toggle.icon1.disableInteractive();
            ui.toggle.icon2.disableInteractive();
        } else {
            buttons.forEach(b => b.setInteractive());
            ui.toggle.icon1.setInteractive();
            ui.toggle.icon2.setInteractive();
        }
    }

    private createTextElements(): void {
        // Text style
        const textStyle: Phaser.Types.GameObjects.Text.TextStyle = {
            fontSize: '19px',
            color: '#FFFFFF',
            fontFamily: 'Inter',
        };

        // Score text
        this.scoreText = this.add.text(-350+350, 7, '', textStyle);

        // Time text
        this.timeText = this.add.text(-275+350, 7, '', textStyle);       
        
        // Time text
        this.movesText = this.add.text(-150+350, 7, '', textStyle);

        this.textContainer.add(this.scoreText)
        this.textContainer.add(this.timeText)
        this.textContainer.add(this.movesText)
   
    }

    private logTopbarDebug(updateTime: number, scoreStr: string, timeStr: string, canWriteTopbar: boolean, registryGameManager?: GameManager): void {
        const domScore = this.htmlScore?.textContent || '';
        const domTime = this.htmlTime?.textContent || '';
        const ownerId = this.gameManager.getTopbarOwnerId();
        const activeOwnerId = getActiveTopbarOwnerId();
        const snapshot = [
            ownerId,
            activeOwnerId || '',
            canWriteTopbar,
            this.gameManager.getCurrentScore(),
            this.gameManager.getElapsedTime(),
            scoreStr,
            timeStr,
            domScore,
            domTime,
            !!registryGameManager,
            registryGameManager === this.gameManager,
            !!this.htmlScore,
            !!this.htmlTime,
        ].join('|');

        if (snapshot === this.topbarDebugLastSnapshot && updateTime - this.topbarDebugLastLogTime < 1000) return;

        this.topbarDebugLastSnapshot = snapshot;
        this.topbarDebugLastLogTime = updateTime;
        topbarDebugLog('UIScene.update topbar', {
            score: this.gameManager.getCurrentScore(),
            elapsedTime: this.gameManager.getElapsedTime(),
            scoreStr,
            timeStr,
            domScore,
            domTime,
            ownerId,
            activeOwnerId,
            canWriteTopbar,
            hasHtmlScore: !!this.htmlScore,
            hasHtmlTime: !!this.htmlTime,
            scoreSpanConnected: !!this.htmlScore?.isConnected,
            timeSpanConnected: !!this.htmlTime?.isConnected,
            hasRegistryGameManager: !!registryGameManager,
            sameGameManager: registryGameManager === this.gameManager,
            uiSceneActive: this.scene.isActive('UIScene'),
        });
    }

    private resize(gameSize: Phaser.Structs.Size): void {
        
        const { width, height } = gameSize;
        
        let textStartX = Registry.uiTextStartX;
        let elementsStartX = Registry.uiElemStartX;
        
        this.textContainer.setPosition(textStartX, 0);
        let scale = Math.min(1, Math.min(width / 1600, height / 900));
        let fontsize = Math.max(12, Math.ceil(20 * Math.sqrt(scale)));
        // Desktop toolbar: centered horizontally
        this.elementsContainer.x = width / 2;
        this.elementsContainer.setScale(scale)

        this.elementsContainer2.setPosition(elementsStartX, 0)
        this.elementsContainer2.x = elementsStartX;
        this.elementsContainer2.setScale(scale)

        

        const textStyle: Phaser.Types.GameObjects.Text.TextStyle = {
            fontSize: fontsize+'px',
            color: '#FFFFFF',
            fontFamily: 'Inter',
        };

        this.scoreText.setStyle(textStyle)
        this.timeText.setStyle(textStyle)
        this.movesText.setStyle(textStyle)
        this.calculateContainerHeightPercentage(height)
        this.updateTextPos()
        
        
        
        if (this.game.device.os.android || this.game.device.os.iOS) {
            if (innerWidth > innerHeight) {
                GameManager.isPotrait = false;
                this.handleMobileLandscape()
            } else {
                GameManager.isPotrait = true;
                this.handleMobilePortrait()
            }
        }
        
    }
    handleMobileLandscape()
    {
        if(this.scale.isFullscreen || !this.isTablet() || (this.game.device.os.iOS && this.isTablet() && this.scale.isGameLandscape)) {
            this.applyMobileLandscapeLayout();

            this.elementsContainer.scale *= 2
            this.elementsContainer2.scale *= 2
            this.textContainer.scale = 1.2

            this.elementsContainer.x = window.innerWidth
            this.elementsContainer2.x = window.innerWidth
            this.elementsContainer3.x = 0
            this.textContainer.x = 10
            this.movesText.setFontSize(19)
            this.scoreText.setFontSize(19)
            this.timeText.setFontSize(19)
            this.movesText.visible = false;

            this.elementsContainer.visible = false;
            this.elementsContainer2.visible = true;
            this.elementsContainer3.visible = this.elementsContainer2.visible
        } else {
            this.elementsContainer.visible = true;
            this.elementsContainer2.visible = false;
            this.elementsContainer3.visible = false;
        }
    }

    handleMobilePortrait()
    {
        this.applyMobilePortraitLayout();

        this.elementsContainer.visible = false;
        this.elementsContainer2.visible = true;
        this.elementsContainer3.visible = true;

        const scaleFactor = Math.min(2.0, window.innerWidth / 500);
        this.elementsContainer2.scale = scaleFactor;
        this.elementsContainer3.scale = scaleFactor;

        this.movesText.setFontSize(22)
        this.scoreText.setFontSize(22)
        this.timeText.setFontSize(22)
        this.textContainer.scale = 1.2;
        this.movesText.visible = false;

        // ec3 (settings/help/stats/night) anchored at left, ec2 (toggle/hint/undo) anchored at right
        this.elementsContainer3.x = 10;
        this.elementsContainer2.x = window.innerWidth - 234 * scaleFactor - 10;
    }

    private applyMobileLandscapeLayout()
    {
        if (!this.mobileUI) return;
        // ec3 left column (4 icons stacked vertically at x=20)
        this.mobileUI.settings.setXY(20, 0);
        this.mobileUI.help.setXY(20, 55);
        this.mobileUI.stats.setXY(20, 110);
        this.mobileUI.night.setXY(20, 165);
        // ec2 right column (toggle stacked vertically, then hint/undo)
        this.mobileUI.toggle.setPosition(-80, 0);
        this.mobileUI.toggle.icon1.setPosition(0, 0);
        this.mobileUI.toggle.icon2.setPosition(0, 55);
        this.mobileUI.hint.setXY(-80, 164);
        this.mobileUI.undo.setXY(-80, 219);
    }

    private applyMobilePortraitLayout()
    {
        if (!this.mobileUI) return;
        // ec3 row: 4 square icons horizontal (0, 60, 120, 180)
        this.mobileUI.settings.setXY(0, 0);
        this.mobileUI.help.setXY(60, 0);
        this.mobileUI.stats.setXY(120, 0);
        this.mobileUI.night.setXY(180, 0);
        // ec2 row: toggle side-by-side (0, 60), hint at 120, undo at 180
        this.mobileUI.toggle.setPosition(0, 0);
        this.mobileUI.toggle.icon1.setPosition(0, 0);
        this.mobileUI.toggle.icon2.setPosition(60, 0);
        this.mobileUI.hint.setXY(120, 0);
        this.mobileUI.undo.setXY(180, 0);
    }

    private calculateContainerHeightPercentage(screenHeight: number): void {
        // Assuming original dimensions of the gameplay container (for example purposes)
          // @ts-ignore
          
           // @ts-ignore
        const originalContainerHeight = this.textContainer.y + window.topBarBottomPosition; // Adjust this to your container's original height
        
        // Get the current scale applied to the container
        const currentScale = this.textContainer.scaleY;
        

        // Calculate the scaled height of the container
        const scaledContainerHeight = originalContainerHeight * currentScale;

        // Calculate the percentage of the screen height taken by the container
        const heightPercentage = (scaledContainerHeight / screenHeight) * 100;

        // Log the percentage
        
        this.registry.set('topUiWidthPercentage', 1.5*heightPercentage/100)
    }
    updateTextPos(){
        
        this.timeText.x = this.scoreText.x + this.scoreText.width
        this.movesText.x = this.timeText.x + this.timeText.width

        let topUI = this.registry.get("topUiWidthPercentage");
        if (topUI==undefined) topUI = 0.01;

        // if (!this.game.device.os.windows)
        
        
        // Desktop default: text at top, button toolbar at bottom. Mobile branches below override these.
        this.textContainer.y = topUI*this.scale.height
        this.elementsContainer.y = this.scale.height * 0.93
        this.elementsContainer2.y = topUI*this.scale.height
        this.elementsContainer3.y = topUI*this.scale.height

        this.registry.set("uiBottomPx", this.textContainer.y + this.scoreText.height*1.5)

        
        if ((this.scale.isGameLandscape && this.game.device.os.iOS && this.isTablet()) || this.registry.get("isFullscreen") || ( !this.game.device.os.desktop && !this.isTablet() && this.scale.isGameLandscape)) {
            
            this.elementsContainer.y = this.scale.height *0.925
            this.elementsContainer2.y = this.scale.height *0.925
            this.elementsContainer2.y = this.scale.height *0.025
            this.textContainer.y = this.scale.height * 0.925

        


            if (this.game.device.os.android || this.game.device.os.iOS) {
                this.elementsContainer.y = this.scale.height *0.9
                this.elementsContainer2.y = this.scale.height *0.07
                this.elementsContainer3.y = this.scale.height *0.07
                if (!this.game.device.os.desktop && !this.isTablet() && this.scale.isGameLandscape && !this.registry.get("isFullscreen")) {
                    this.elementsContainer2.y = this.scale.height *0.09
                    this.elementsContainer3.y = this.scale.height *0.09
                }
                this.textContainer.y = this.scale.height * 0.9 
                // this.textContainer.y = this.scale.height * 0.525
                if (this.game.device.os.iPad) {
                    this.textContainer.y = this.scale.height * 0.86 
                } 
            }
        }
        else {
            this.textContainer.y = topUI*this.scale.height

            if (this.game.device.os.android || this.game.device.os.iOS) {

                if (!this.game.device.os.iPad) {
                    this.elementsContainer.y = window.innerHeight * 0.86
                    this.elementsContainer2.y = window.innerHeight * 0.86
                    this.elementsContainer3.y = window.innerHeight * 0.86
                } else if (this.game.device.os.iPad && innerHeight > innerWidth) {
                    this.elementsContainer.y = window.innerHeight * 0.86
                    this.elementsContainer2.y = window.innerHeight * 0.86
                    this.elementsContainer3.y = window.innerHeight * 0.86
                }
            }
        }

    }


    private isTablet(): boolean {
        // Tablets generally have an aspect ratio between 1 and 1.6
        const aspectRatio = window.innerWidth / window.innerHeight;
        // Screen diagonal size in inches (e.g., diagonal of a 10.1" tablet)
        // const screenDiagonalInches = Math.sqrt(window.innerWidth**2 + window.innerHeight**2) / window.devicePixelRatio;
        
        // Typically, tablets have a screen size between 7 and 13 inches
        const isTabletAspectRatio = aspectRatio > 1 && aspectRatio < 1.6;
        // const isTabletSize = screenDiagonalInches > 7 && screenDiagonalInches < 13;

        

        return isTabletAspectRatio && (this.game.device.os.android || this.game.device.os.iOS);
    }

    private toggleNightMode(): void {
        const next = !NIGHT_MODE_ACTIVE;
        toggleNightModeActive(next);
        const bg = this.scene.get('BackgroundScene') as any;
        if (bg && bg.setNightMode) bg.setNightMode(next);
    }
}

import { Scene } from 'phaser';
import { CardNameManager } from '../managers/CardNameManager';
import { getBGINDEX, loadDefaultSettings, loadSettings } from '../config/Config';
import { GameManager } from '../managers/GameManager';

export class Preloader extends Scene {
    cardManager: CardNameManager;
    errorMessage: Phaser.GameObjects.Text;

    constructor() {
        super('Preloader');
        
    }

    isMobile() {
        const ua = navigator.userAgent;
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);
    }

    enterFullscreen() {
        if (!this.scale.isFullscreen) {
            this.scale.startFullscreen();
        }
    }

    maintainFullscreen() {
        if (this.isMobile() && !this.scale.isFullscreen) {
            this.scale.startFullscreen();
        }
    }

    init() {
        // Add tap/click event listener to enter fullscreen mode
        this.input.on('pointerup', () => {
            if (this.isMobile()) {
                this.enterFullscreen();
            }
        });

        this.createProgressBar();
        this.createErrorMessage();

        // Add global error handling
        window.onerror = (message, source, lineno, colno, error) => {
            this.displayErrorMessage(`Error: ${message} at ${source}:${lineno}:${colno}`);
            console.error('Global Error: ', error);
            return true; // Prevent the default browser error handling
        };

        this.sys.game.events.on('error', (error: Error) => {
            this.displayErrorMessage(`Phaser Error: ${error.message}`);
            console.error('Phaser Error: ', error);
        });
    }

    createProgressBar() {
        // Create a simple progress bar
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        const centerX = this.cameras.main.centerX;
        const centerY = this.cameras.main.centerY;

        // Outline of the progress bar
        this.add.rectangle(centerX, centerY, 468, 32).setStrokeStyle(1, 0xffffff);

        // Progress bar itself
        const bar = this.add.rectangle(centerX - 230, centerY, 4, 28, 0xffffff).setOrigin(0, 0.5);

        // Update the progress bar based on the percentage of loading completed
        this.load.on('progress', (progress: number) => {
            bar.width = 4 + (460 * progress);
        });
    }

    createErrorMessage() {
        const centerX = this.cameras.main.centerX;
        const centerY = this.cameras.main.centerY;

        this.errorMessage = this.add.text(centerX, centerY + 50, '', {
            fontFamily: 'Open Sans', fontSize: '32px', color: '#ff0000', align: 'center'
        }).setOrigin(0.5, 0.5);
    }

    displayErrorMessage(message: string) {
        if (this.errorMessage) {
            this.errorMessage.setText(message);
        } else {
            console.error('Error Message:', message);
        }
    }

    preload() {
        // Load the assets for the game - Replace with your own assets
        this.load.setPath('assets');

        

        this.load.image('holder_foundation_cards', 'placeholders/foundation-empty.png');
        this.load.image('holder_stock_cards', 'placeholders/redeal-stock.png');
        this.load.image('holder_tableau_cards', 'placeholders/tableau-empty.png');
        this.load.image('prompt_btn_left', 'prompt_btn_left.png');
        this.load.image('prompt_btn_right', 'prompt_btn_right.png');
        this.load.image('prompt_close', 'prompt_close.png');
        this.load.image('prompt_radio_off', 'prompt_radio_off.png');
        this.load.image('prompt_radio_on', 'prompt_radio_on.png');
        this.load.image('reddish_glow_outline', 'placeholders/card-hint-overlay.png');
        this.load.image('backside', 'backside.png');

        // Wood backgrounds (light = normal mode, dark = night mode)
        this.load.image('bg-light', 'bg-light.jpg');
        this.load.image('bg-dark', 'bg-dark.jpg');

        // Toolbar buttons — desktop art
        this.load.image('btn-1-card-off', 'menu/btn-1-card-off.png');
        this.load.image('btn-1-card-off-hover', 'menu/btn-1-card-off-hover.png');
        this.load.image('btn-1-card-on', 'menu/btn-1-card-on.png');
        this.load.image('btn-1-card-on-hover', 'menu/btn-1-card-on-hover.png');
        this.load.image('btn-3-card-off', 'menu/btn-3-card-off.png');
        this.load.image('btn-3-card-off-hover', 'menu/btn-3-card-off-hover.png');
        this.load.image('btn-3-card-on', 'menu/btn-3-card-on.png');
        this.load.image('btn-3-card-on-hover', 'menu/btn-3-card-on-hover.png');
        this.load.image('btn-hint', 'menu/btn-hint.png');
        this.load.image('btn-hint-hover', 'menu/btn-hint-hover.png');
        this.load.image('btn-undo', 'menu/btn-undo.png');
        this.load.image('btn-undo-hover', 'menu/btn-undo-hover.png');
        this.load.image('icon-settings', 'menu/icon-settings.png');
        this.load.image('icon-settings-hover', 'menu/icon-settings-hover.png');
        this.load.image('icon-help', 'menu/icon-help.png');
        this.load.image('icon-help-hover', 'menu/icon-help-hover.png');
        this.load.image('icon-stats', 'menu/icon-stats.png');
        this.load.image('icon-stats-hover', 'menu/icon-stats-hover.png');
        this.load.image('icon-night', 'menu/icon-night.png');
        this.load.image('icon-night-hover', 'menu/icon-night-hover.png');

        // Toolbar buttons — mobile art (always loaded; UIScene builds both UIs unconditionally)
        this.load.image('mobile-btn-1-card-off', 'menu/mobile-btn-1-card-off.png');
        this.load.image('mobile-btn-1-card-on', 'menu/mobile-btn-1-card-on.png');
        this.load.image('mobile-btn-3-card-off', 'menu/mobile-btn-3-card-off.png');
        this.load.image('mobile-btn-3-card-on', 'menu/mobile-btn-3-card-on.png');
        this.load.image('mobile-btn-hint', 'menu/mobile-btn-hint.png');
        this.load.image('mobile-btn-undo', 'menu/mobile-btn-undo.png');

        

        const isMobile = this.game.device.os.android || this.game.device.os.iOS;

        GameManager.isMobile = isMobile;
        // Load the appropriate multiatlas
        
        // loadDefaultSettings()
        
        
        let locationBase;
        try {
             locationBase = '' + window.location.origin+'/';
             
        } catch (e) {
            this.displayErrorMessage('Error loading assets: ' + e);
            
        }

        console.log(locationBase, window.location.hostname)

        // locationBase = 'http://gamestest.net/';
        if (window.location.hostname == 'localhost' ) {
            this.load.json('cardData', 'assets.json');
            if (isMobile) {
                this.load.multiatlas('cards', 'assets_mobile1.json', 'assets');
            } else {
                this.load.multiatlas('cards', 'assets.json', 'assets');
                
            }
            this.load.audio('card_to_foundation', '/sounds/card-to-foundation.mp3');
            this.load.audio('click', '/sounds/click.mp3');
            this.load.audio('deal_cards', '/sounds/deal-cards.mp3');
            this.load.audio('end_3', '/sounds/end_3.mp3');
            this.load.audio('flip_back_to_stock', '/sounds/flip-back-to-stock.mp3');
            this.load.audio('grab_card', '/sounds/grab-card.mp3');
            this.load.audio('hint', '/sounds/hint.mp3');
            this.load.audio('invalid', '/sounds/invalid.mp3');
            this.load.audio('no_hint', '/sounds/no-hint.mp3');
            this.load.audio('silence', '/sounds/silence.mp3');
            // this.load.audio('test', '/sounds/test.mp3');
            this.load.audio('undo', '/sounds/undo.mp3');
            this.load.audio('valid', '/sounds/valid.mp3');
            this.load.audio('won', '/sounds/won.mp3');

        } else {
            try {
                let locationToLoad = locationBase + 'shared/'
                console.log(locationToLoad)
                if (isMobile) {

                    locationToLoad += 'cards_mobile/assets_mobile1.json'
                    console.log(locationToLoad)

                    this.load.multiatlas('cards', locationToLoad, locationBase + 'shared/cards_mobile');
                } else {
                    locationToLoad += 'cards_desktop/assets.json'
                    console.log(locationToLoad)
                    this.load.multiatlas('cards', locationToLoad, locationBase + 'shared/cards_desktop');
                    console.log(locationToLoad)
                }
                this.load.json('cardData', locationBase + 'shared/cards_desktop' + '/assets.json');
                locationToLoad = locationBase + 'shared'
                
                this.load.audio('card_to_foundation', locationToLoad + '/sounds/card-to-foundation.mp3');
                this.load.audio('click', locationToLoad + '/sounds/click.mp3');
                this.load.audio('deal_cards', locationToLoad + '/sounds/deal-cards.mp3');
                this.load.audio('end_3', locationToLoad + '/sounds/end_3.mp3');
                this.load.audio('flip_back_to_stock', locationToLoad + '/sounds/flip-back-to-stock.mp3');
                this.load.audio('grab_card', locationToLoad + '/sounds/grab-card.mp3');
                this.load.audio('hint', locationToLoad + '/sounds/hint.mp3');
                this.load.audio('invalid', locationToLoad + '/sounds/invalid.mp3');
                this.load.audio('no_hint', locationToLoad + '/sounds/no-hint.mp3');
                this.load.audio('silence', locationToLoad + '/sounds/silence.mp3');
                // this.load.audio('test', '/sounds/test.mp3');
                this.load.audio('undo', locationToLoad + '/sounds/undo.mp3');
                this.load.audio('valid', locationToLoad + '/sounds/valid.mp3');
                this.load.audio('won', locationToLoad + '/sounds/won.mp3');
            } catch (error) {
                this.displayErrorMessage('Error loading assets: ' + error);
                console.error('Error loading assets:', error);
            }
        }
    }

    create() {
        // When all the assets have loaded, it's often worth creating global objects here that the rest of the game can use.
        // For example, you can define global animations here, so we can use them in other scenes.

        // Move to the MainMenu. You could also swap this for a Scene Transition, such as a camera fade.


        loadDefaultSettings(this.game.device.os.android || this.game.device.os.iOS)
        loadSettings()

        const cardData = this.cache.json.get('cardData');

        if (cardData && cardData.textures) {
            const frames = cardData.textures[0].frames;

            this.cardManager = CardNameManager.Instance;
            this.cardManager.loadCardData(frames);

            this.scene.start('BackgroundScene');
            this.scene.launch('GameplayScene');
        } else {
            this.displayErrorMessage('Error: Invalid card data.');
        }
    }

    resize() {
        this.createProgressBar();
    }
}

export default Preloader;

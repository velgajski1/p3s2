import { Scene } from 'phaser';
import { CardNameManager } from '../managers/CardNameManager';
import { loadSettings } from '../config/Config';
import { GameManager } from '../managers/GameManager';

export class Preloader extends Scene {
    cardManager: CardNameManager;

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

    preload() {
        // Load the assets for the game - Replace with your own assets
        this.load.setPath('assets');

        this.load.image('ace', 'ace.png');
        this.load.image('hint', 'hint.png');
        this.load.image('klondike_1_turn', 'klondike_1_turn.png');
        this.load.image('holder_foundation_cards', 'holder_foundation_cards.png');
        this.load.image('holder_stock_cards', 'holder_stock_cards.png');
        this.load.image('holder_tableau_cards', 'holder_tableau_cards.png');
        this.load.image('klondike_1_turn_selected', 'klondike_1_turn_selected.png');
        this.load.image('klondike_3_turn', 'klondike_3_turn.png');
        this.load.image('klondike_3_turn_selected', 'klondike_3_turn_selected.png');
        this.load.image('menu', 'menu.png');
        this.load.image('prompt_btn_left', 'prompt_btn_left.png');
        this.load.image('prompt_btn_right', 'prompt_btn_right.png');
        this.load.image('prompt_close', 'prompt_close.png');
        this.load.image('prompt_radio_off', 'prompt_radio_off.png');
        this.load.image('prompt_radio_on', 'prompt_radio_on.png');
        this.load.image('settings', 'settings.png');
        this.load.image('undo', 'undo.png');
        this.load.image('undo_na', 'undo_na.png');
        this.load.image('reddish_glow_outline', 'hint-overlay.png');
        this.load.image('backside', 'backside.png');

        this.load.json('cardData', 'assets.json');

        const isMobile = this.game.device.os.android || this.game.device.os.iOS;

        GameManager.isMobile = isMobile;
        // Load the appropriate multiatlas
        if (isMobile) {
            this.load.multiatlas('cards', 'assets_mobile.json', 'assets');
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
        this.load.audio('undo', '/sounds/undo.mp3');
        this.load.audio('valid', '/sounds/valid.mp3');
        this.load.audio('won', '/sounds/won.mp3');
    }

    create() {
        // When all the assets have loaded, it's often worth creating global objects here that the rest of the game can use.
        // For example, you can define global animations here, so we can use them in other scenes.

        // Move to the MainMenu. You could also swap this for a Scene Transition, such as a camera fade.
       
        const cardData = this.cache.json.get('cardData');

        const frames = cardData.textures[0].frames;

        this.cardManager = CardNameManager.Instance;
        this.cardManager.loadCardData(frames);

        this.scene.start('BackgroundScene');
        this.scene.launch('GameplayScene');
    }

    resize() {
        this.createProgressBar();
    }
}

export default Preloader;

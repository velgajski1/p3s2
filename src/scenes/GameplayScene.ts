import Phaser from 'phaser';
import { GameManager } from '../managers/GameManager';
import Registry from '../config/Registry';
import { TABLEU_COORDS_DELTA, STOCK_COORDS, getCardScale } from '../config/Consts';
import BaseScene from './BaseScene';
import { SoundManager } from '../managers/SoundManager';
import { useTabletLandscapeLayout } from '../utils/Utils';

export class GameplayScene extends BaseScene {
    private gameplayContainer!: Phaser.GameObjects.Container;
    gameManager: GameManager;
    soundManager: SoundManager;
    private orientationRecoveryTimers: ReturnType<typeof setTimeout>[] = [];
    private orientationRecoveryHandler?: () => void;
    private visibilityHandler?: () => void;

    constructor() {
        super('GameplayScene');
        

        
    }

    

    create(): void {
        super.create()
        this.gameplayContainer = this.add.container(this.scale.width / 2, this.scale.height / 2);
        

        // Initialize the GameManager with this scene and the UIScene
        this.gameManager = GameManager.getInstance(this, this.gameplayContainer);
        this.registry.set('gameManager', this.gameManager);

        // Start the game
        this.gameManager.startGame();

        // Listen for resize events to dynamically adjust the container
        this.scale.on('resize', this.resize, this);
        

        this.scene.launch("UIScene");
        this.scene.bringToTop("UIScene");


        this.game.canvas.addEventListener('contextmenu', function (event) {
            event.preventDefault();
        })

            // Listen for the custom event
        this.events.once('restartScene', this.restartScene, this);
        this.resize(this.scale.gameSize as unknown as Phaser.Structs.Size);


        SoundManager.init(this);
        SoundManager.instance.silence.play()

        this.wireOrientationRecovery();
        this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.teardownOrientationRecovery, this);
        this.events.once(Phaser.Scenes.Events.DESTROY, this.teardownOrientationRecovery, this);
    }

    private wireOrientationRecovery(): void {
        // Mobile browsers can stabilize at intermediate viewport dimensions during
        // rotation. Android Chrome also refuses fullscreen until the next user gesture,
        // so the eventual fullscreenchange needs the same refresh/relayout path.
        this.orientationRecoveryHandler = () => {
            // Cancel any pending relayouts from a previous rotation so we don't pile up.
            this.orientationRecoveryTimers.forEach(t => clearTimeout(t));
            this.orientationRecoveryTimers = [];
            [0, 100].forEach(ms => {
                this.orientationRecoveryTimers.push(
                    setTimeout(() => this.refreshScaleAndResize(), ms)
                );
            });
        };
        // Returning to the app (tab switch, background -> foreground, bfcache restore) can leave iPad
        // Chrome scrolled with the HTML top bar pushed off-screen and the game shifted up — run the same
        // refresh/relayout path (which re-pins the scroll) when we become visible.
        this.visibilityHandler = () => {
            if (document.visibilityState === 'visible') this.orientationRecoveryHandler?.();
        };
        window.addEventListener('orientationchange', this.orientationRecoveryHandler);
        window.addEventListener('resize', this.orientationRecoveryHandler);
        document.addEventListener('fullscreenchange', this.orientationRecoveryHandler);
        // Visual Viewport reports post-settle dimensions reliably on mobile browsers.
        window.visualViewport?.addEventListener('resize', this.orientationRecoveryHandler);
        window.addEventListener('pageshow', this.orientationRecoveryHandler);
        window.addEventListener('focus', this.orientationRecoveryHandler);
        document.addEventListener('visibilitychange', this.visibilityHandler);
    }

    private teardownOrientationRecovery(): void {
        if (this.orientationRecoveryHandler) {
            window.removeEventListener('orientationchange', this.orientationRecoveryHandler);
            window.removeEventListener('resize', this.orientationRecoveryHandler);
            document.removeEventListener('fullscreenchange', this.orientationRecoveryHandler);
            window.visualViewport?.removeEventListener('resize', this.orientationRecoveryHandler);
            window.removeEventListener('pageshow', this.orientationRecoveryHandler);
            window.removeEventListener('focus', this.orientationRecoveryHandler);
            this.orientationRecoveryHandler = undefined;
        }
        if (this.visibilityHandler) {
            document.removeEventListener('visibilitychange', this.visibilityHandler);
            this.visibilityHandler = undefined;
        }
        this.orientationRecoveryTimers.forEach(t => clearTimeout(t));
        this.orientationRecoveryTimers = [];
    }

    private resize(gameSize: Phaser.Structs.Size): void {
        this.doResize(gameSize);
        setTimeout(() => {
            this.doResize(this.scale.gameSize as Phaser.Structs.Size);
        }, 10);
        setTimeout(() => {
            this.doResize(this.scale.gameSize as Phaser.Structs.Size);
        }, 90);
        // Long-tail pass for slow rotations on iOS/Android (URL bar settling, safe-area shifts).
        // Reads the latest gameSize from this.scale so we use whatever Phaser sees after settling.
        // setTimeout(() => {
        //     this.doResize(this.scale.gameSize as Phaser.Structs.Size);
        // }, 500);

    }

    private refreshScaleAndResize(): void {
        // iPad Chrome can return from the background with the page scrolled down, pushing the absolute
        // HTML top bar off-screen and shifting the game up. Re-pin to the top first. The game never
        // scrolls itself, and embedded it runs in an iframe, so this can't fight host-page scrolling.
        if (this.game.device.os.iOS) window.scrollTo(0, 0);
        this.scale.refresh();
        this.doResize(this.scale.gameSize as Phaser.Structs.Size);
    }

    private doResize(gameSize: Phaser.Structs.Size) : void {
        const { width, height } = gameSize;
        let topUI = this.registry.get("topUiWidthPercentage");
        if (topUI==undefined) topUI = 0.04;
        let scale = Math.min(width / 1200, height / 900);
        this.gameplayContainer.setScale(scale);
        // let top = height * (0.04 + topUI);
        let top = this.registry.get("uiBottomPx")
        
        
        // iOS landscape uses a compact gameplay layout. Fullscreen toggling (desktop/mobile)
        // intentionally does NOT trigger a reposition — keep the same layout in and out of fullscreen.
        if (this.game.device.os.iOS && this.isLandscape() && !this.scale.isFullscreen) {
            top = 20;
            let delta = Math.max(0, 2 - this.scale.gameSize.aspectRatio)

            scale *= (1 +0.2 - delta);
            this.gameplayContainer.setScale(scale);
            this.registry.set("isFullscreen", true);
        } else {
            this.registry.set("isFullscreen", false);
        }


        this.gameplayContainer.setPosition(width / 2, top);
        if (this.scale.isPortrait) {
            this.gameplayContainer.setPosition(0.505*width, top);

        }
        if (!this.game.device.os.desktop && !this.isTablet() && this.scale.isGameLandscape && !this.registry.get("isFullscreen")) {
            this.gameplayContainer.setPosition(width / 2, top*0.7);
        }
        // NOTE: the old iOS-tablet branch (scale*1.3, 3*top) is replaced by the useTabletLandscapeLayout
        // branch below the hard-floor clamp, which also covers fullscreen Android tablets.

        // Hard floor: keep cards from extending into the 44px HTML top bar.
        // Desktop is intentionally placed 18px ABOVE the clamp (tighter against the bar).
        const TOP_BAR_HEIGHT = 44;
        const minContainerY = TOP_BAR_HEIGHT + 50 * this.gameplayContainer.scaleY;
        if (this.game.device.os.desktop) {
            this.gameplayContainer.y = minContainerY - 18;
        } else if (this.gameplayContainer.y < minContainerY) {
            this.gameplayContainer.y = minContainerY;
        }

        // Tablet landscape (iPad, or fullscreen Android tablet): scale the board so the 7-pile tableau
        // fills ~82% of screen width (leaving room for the edge-pinned button columns), capped by height
        // so cards never get absurd on short windows. Placed AFTER the hard-floor clamp so the clamp
        // can't bump our anchored board down and break the side-button alignment. Desktop never enters.
        if (useTabletLandscapeLayout(this)) {
            const CARD_AREA_FRAC = 0.82;
            const TABLEAU_LOCAL_W = 1095;  // 7 piles: 6*160 stride + ~135px card (180 frame * 0.75 landscape scale)
            const CARD_FRAME_H = 253;
            const sWidth = CARD_AREA_FRAC * width / TABLEAU_LOCAL_W;
            const sHeight = 0.25 * height / (CARD_FRAME_H * getCardScale()); // single-card height <= ~25% of screen
            const S = Math.min(sWidth, sHeight);
            this.gameplayContainer.setScale(S);

            // Klondike's stock/waste/foundation cards render at full getCardScale() (no STOCK_FOUNDATION_SCALE),
            // so the top row is taller than Spider's. Anchoring at 2.2*top would push it under the 44px bar —
            // instead seat the top-row's TOP a fixed gap below the bar and back-solve the container centre.
            // This also makes the side-button alignment exact (the published Y == the row's on-screen top).
            const stockTopLocal = STOCK_COORDS.y - (CARD_FRAME_H * getCardScale()) / 2; // top edge of stock/found row, local
            const BAR_H = 44, GAP = 14;
            const stockTopY = BAR_H + GAP;
            this.gameplayContainer.setPosition(width / 2, stockTopY - stockTopLocal * S);
            this.registry.set('ipadStockTopY', stockTopY);
        }


        const adjustedStartX = (width / 2) + -554 * scale;
        Registry.uiTextStartX = adjustedStartX
        // Registry.uiElemStartX = adjustedStartX + 1500
        Registry.uiElemStartX = width/2 +552*scale; 

        setTimeout(() => {

            this.gameManager.pileManager.tableuPilesYDelta = Array.from({length:7}, () => TABLEU_COORDS_DELTA.y)
            this.gameManager.pileManager.fixTableuYDeltaAll()
            
            this.gameManager.layoutManager.update()
            this.gameManager.layoutManager.layoutTableauPiles(this.gameManager.pileManager.getTableauPiles())
            this.gameManager.layoutManager.updateTabIndicators()         
        }, 300);


    }


    private restartScene(): void {
        // Stop the UIScene if it needs to be stopped
        this.scene.stop("UIScene");
        this.scene.stop("GameplayScene");

        // Restart the GameplayScene
        this.scene.restart();
    }

}



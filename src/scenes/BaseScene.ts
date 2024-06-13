import Phaser from 'phaser';

export default class BaseScene extends Phaser.Scene {
    constructor(key: string) {
        super({ key });
    }

    preload(): void {
        // Override this method in your scenes to load assets
    }

    create(): void {


            // Add event listener for orientation change to maintain fullscreen
               window.addEventListener('orientationchange', () => {
                this.maintainFullscreen();
            });

             this.input.on('pointerup', () => {
                this.maintainFullscreen();
            })
        }

        private maintainFullscreen() {
            console.log(this.isMobile(), this.isFullscreen(), this.isLandscape())
            if (this.isMobile() && !this.isFullscreen() && this.isLandscape()) {
                this.enterFullscreen();
            }
            else if (this.isFullscreen() && !this.isLandscape()) {
                this.exitFullscreen();
            }
                
            
        }

        private isLandscape(): boolean {
            return window.innerWidth > window.innerHeight;
        }
    
        private isFullscreen(): boolean {
            return this.scale.isFullscreen;
        }
    
        private exitFullscreen(): void {
            console.log("exitFullscreen")
            if (this.scale.isFullscreen) {
                this.scale.stopFullscreen();
            }
        }
    private isMobile(): boolean {
        const ua = navigator.userAgent;
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);
    }

    private enterFullscreen(): void {
        console.log("enterFullscreen")
        if (!this.scale.isFullscreen) {
            this.scale.startFullscreen();
        }
    }

}

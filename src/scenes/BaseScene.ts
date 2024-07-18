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

        protected maintainFullscreen() {
            
            if (this.isMobile() && !this.isFullscreen() && this.isLandscape()) {
                this.enterFullscreen();
            }
            else if (this.isFullscreen() && !this.isLandscape()) {
                this.exitFullscreen();
            }
                
            
        }

        protected isLandscape(): boolean {
            return window.innerWidth > window.innerHeight;
        }
    
        protected isFullscreen(): boolean {
            return this.scale.isFullscreen;
        }
    
        private exitFullscreen(): void {
            
            if (this.scale.isFullscreen) {
                this.scale.stopFullscreen();
            }
        }
        private isMobile() {
            const userAgent = navigator.userAgent
            // console.log(this.sys.game.device.os.android,this.sys.game.device.os.iOS,this.sys.game.device.os.windows)
            return this.sys.game.device.os.android || 
                   this.sys.game.device.os.iOS;
        }

        

    private enterFullscreen(): void {
        
        if (!this.scale.isFullscreen && this.isMobile()) {
            try {
                this.scale.startFullscreen();
            } catch (e) {
                console.log(e)
            }
            
        }
    }

}



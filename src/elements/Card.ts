// Card.ts
import Phaser from 'phaser';
import { HINT_OVERLAY_DURATION, PileType, STOCK_COORDS, WASTE_DELTA_FROM_STOCK } from '../config/Consts';
import { CardNameManager, Rank, Suit } from '../managers/CardNameManager';
import { GameManager } from '../managers/GameManager';
import ControlManager from '../managers/ControlManager';
import { getTweensForObject } from '../utils/Utils';
import { RIGHT_HANDED_MODE_ACTIVE, RIGHT_HANDED_MODE_IDX } from '../config/Config';


export default class Card extends Phaser.GameObjects.Sprite {


    private faceTexture: string; // Path to the face texture
    private backTexture: string; // Path to the back texture
    public isFaceUp: boolean; // Card's state
    pileType: PileType;
    pileIndex: any;
    suit: Suit;
    rank: Rank;
    controlManager: ControlManager;
    inTransition: boolean = false;
    substackid: Number = 0;
    wasteDeltaX: number;
    textures: Phaser.Textures.TextureManager;
    hintBlinkCount: number;
    hintMaxBlinks: number;
    hintTimerEvent: Phaser.Time.TimerEvent;
    outline: Phaser.GameObjects.Sprite;

    constructor(scene: Phaser.Scene, x: number, y: number, suit : Suit, rank : Rank, isFaceUp: boolean) {
        

        let faceTexture = CardNameManager.Instance.getCardName(suit, rank);

        super(scene, x, y, 'cards', 'cards/backside.png');
        if (isFaceUp)
        {
            this.setTexture2(faceTexture);
        }
        this.suit = suit;
        this.rank = rank;
        this.name = CardNameManager.Instance.getCardName(suit, rank);

        
        this.faceTexture = faceTexture;
        this.backTexture =  'backside';
        this.isFaceUp = isFaceUp; // Initially, cards are face down

        // Add this card to the scene
        scene.add.existing(this);

        this.textures = this.scene.textures;

    }

    createInvertedFrameTexture(spritesheetKey: string, frameIndex: string, newTextureKey: string) {

        // console.log(newTextureKey)
        if (this.textures.checkKey(newTextureKey)) {
            // console.log('createInvertedFrameTexture')
            return;
        } 
        const frame = this.textures.getFrame(spritesheetKey, frameIndex);

        if (!frame) {
            console.error(`Frame ${frameIndex} not found in texture ${spritesheetKey}`);
            return;
        }

        const sourceImage = frame.source.image as HTMLImageElement | HTMLCanvasElement | HTMLVideoElement;

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        if (ctx) {
            canvas.width = frame.width;
            canvas.height = frame.height;

            // Draw the specific frame onto the canvas
            ctx.drawImage(
                sourceImage,
                frame.cutX,
                frame.cutY,
                frame.width,
                frame.height,
                0,
                0,
                frame.width,
                frame.height
            );

            // Get the image data from the canvas
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imageData.data;

            // Invert the colors
            for (let i = 0; i < data.length; i += 4) {
                data[i] = 255 - data[i];       // Red
                data[i + 1] = 255 - data[i + 1]; // Green
                data[i + 2] = 255 - data[i + 2]; // Blue
            }

            // Put the modified image data back onto the canvas
            ctx.putImageData(imageData, 0, 0);

            // Create a new texture from the canvas
            this.textures.addCanvas(newTextureKey, canvas);
        }
    }

    setHintTexture(on : boolean) {
        // console.log(this.name, this.isFaceUp,on)
        if (this.isFaceUp) {
            if (on) {
                this.setTexture(this.faceTexture+'_hint')
            }
            else {
                this.setTexture2(this.faceTexture)
            }
        }
        else {
            if (on) {
                this.setTexture(this.backTexture + '_hint')
            }
            else {
                this.setTexture2(this.backTexture)
            }
        }
        
    }

    update() {
        if (this.outline) {
            this.outline.x = this.x;
            this.outline.y = this.y;
        }
    }

    startHintAnim(cropY : number) {
        if (!this.scene) return;
        this.cancelHintAnim()
        this.addOutline(this.scene, cropY);
        const blinkInterval = HINT_OVERLAY_DURATION // Total duration divided by double the number of blinks

        this.hintTimerEvent = this.scene.time.addEvent({
            delay: blinkInterval,
            callback: () => {
                this.removeOutline()
                
            }
        });
    }

    cancelHintAnim() {
      
        if (this.hintTimerEvent) {
           
            this.hintTimerEvent.remove()
        }
        
        this.removeOutline()
    }

    isOnStock()
    {
        return (PileType.Stock == this.pileType)
    }
    renewWasteCoords(cManager : ControlManager): void
    {
        if (cManager)
        { 

            this.x = STOCK_COORDS.x[RIGHT_HANDED_MODE_IDX]+WASTE_DELTA_FROM_STOCK[RIGHT_HANDED_MODE_IDX]+this.wasteDeltaX;
            this.y = STOCK_COORDS.y;


        }
    }
    
    finishTweens()
    {
        getTweensForObject(this.scene, this).forEach(x => x.complete());
        this.inTransition = false;
    }

    removeTweens()
    {
        getTweensForObject(this.scene, this).forEach(x => x.remove());
        this.inTransition = false;
    }

    isOnTableu()
    {
        return (PileType.Tableau == this.pileType)
    }
    
    isBeingFlipped: boolean = false;
    
    addInteractive()
    {
        this.controlManager.setupCardClickControl(this);
    }

    hasTweens() {
        
        if (getTweensForObject(this.scene, this).length > 0) {
            
            
            return true;
        }

        return false;
    }


    setPileType(pileType: PileType)
    {
        this.pileType = pileType;
    }




    flip(): void {
        if (this.isFaceUp) {
            this.setTexture2(this.backTexture);
            this.isFaceUp = false;
        } else {
            this.setTexture2(this.faceTexture);
            this.isFaceUp = true;
        }
    }

    removeCompletedTweens(): void
    {
        getTweensForObject(this.scene, this).forEach(x => {
            
            if (x.totalProgress >= 1) x.remove();
        });
        
    }

    setFaceUp(isFaceUp: boolean)
    {
        if (isFaceUp) {
            
            this.setTexture2(this.faceTexture);
            this.isFaceUp = isFaceUp;
        } else {
            this.setTexture2(this.backTexture);
            this.isFaceUp = isFaceUp;
        }
    }

    setPile(pileType: PileType, pileIndex: number): void {
        this.pileType = pileType;
        this.pileIndex = pileIndex;
    }

    addOutline(scene: Phaser.Scene, cropY:number): void{
        if (!scene) return;
       this.outline = scene.add.sprite(this.x-1, this.y-1, 'reddish_glow_outline' ).setScale(this.scale)
       scene.add.existing(this.outline)
       this.outline.setDepth(100000)
       this.parentContainer.add(this.outline)

       if (cropY > 0) {
        this.outline.setCrop(0,0,this.outline.width, cropY/this.scale)
       }

      

    }

    removeOutline() {
        if (this.outline) {
            this.outline.destroy()
        }
    }

    setTexture2(frame: string) : this
    {
        super.setTexture('cards', 'cards/' + frame + '.png')
        return this;
    }

    getName() : string { return this.name + ", faceup="+this.isFaceUp+", pile="+this.pileType + " x/y= " + this.x +","+ this.y }

    // Additional methods to manipulate the card state...
}

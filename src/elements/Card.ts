// Card.ts
import Phaser from 'phaser';
import { PileType, STOCK_COORDS, WASTE_DELTA_FROM_STOCK } from '../config/Consts';
import { CardNameManager, Rank, Suit } from '../managers/CardNameManager';
import { GameManager } from '../managers/GameManager';
import ControlManager from '../managers/ControlManager';
import { getTweensForObject } from '../utils/Utils';


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

    }

    isOnStock()
    {
        return (PileType.Stock == this.pileType)
    }
    renewWasteCoords(cManager : ControlManager): void
    {
        if (cManager)
        {
            this.x = STOCK_COORDS.x+WASTE_DELTA_FROM_STOCK;
            this.y = STOCK_COORDS.y;


        }
    }
    
    finishTweens()
    {
        getTweensForObject(this.scene, this).forEach(x => x.complete());
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

    setTexture2(frame: string) : this
    {
      
        super.setTexture('cards', 'cards/' + frame + '.png')
        return this;
    }

    getName() : string { return this.name;}

    // Additional methods to manipulate the card state...
}

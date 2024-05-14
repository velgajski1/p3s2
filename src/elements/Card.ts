// Card.ts
import Phaser from 'phaser';
import { PileType } from '../config/Consts';
import { CardNameManager, Rank, Suit } from '../managers/CardNameManager';
import { GameManager } from '../managers/GameManager';
import ControlManager from '../managers/ControlManager';

export default class Card extends Phaser.GameObjects.Sprite {
    addInteractive()
    {
        this.controlManager.setupCardClickControl(this);
    }


    private faceTexture: string; // Path to the face texture
    private backTexture: string; // Path to the back texture
    public isFaceUp: boolean; // Card's state
    pileType: PileType;
    pileIndex: any;
    suit: Suit;
    rank: Rank;
    controlManager: ControlManager;
    inTransition: boolean = false;



    constructor(scene: Phaser.Scene, x: number, y: number, suit : Suit, rank : Rank, isFaceUp: boolean) {
        
        let faceTexture = CardNameManager.Instance.getCardName(suit, rank);
        super(scene, x, y, 'cards', 'cards/backside.png');
        if (isFaceUp)
        {
            this.setTexture(faceTexture);
        }
        this.suit = suit;
        this.rank = rank;
        this.name = CardNameManager.Instance.getCardName(suit, rank);

        
        this.faceTexture = faceTexture;
        this.backTexture =  'cards/backside.png';
        this.isFaceUp = isFaceUp; // Initially, cards are face down


        // Add this card to the scene
        scene.add.existing(this);

    }

    setPileType(pileType: PileType)
    {
        this.pileType = pileType;
    }




    flip(): void {
        if (this.isFaceUp) {
            this.setTexture(this.backTexture);
            this.isFaceUp = false;
        } else {
            this.setTexture(this.faceTexture);
            this.isFaceUp = true;
        }
    }

    setFaceUp(isFaceUp: boolean)
    {
        if (isFaceUp) {
            this.setTexture(this.faceTexture);
            this.isFaceUp = isFaceUp;
        } else {
            this.setTexture(this.backTexture);
            this.isFaceUp = isFaceUp;
        }
    }

    setPile(pileType: PileType, pileIndex: number): void {
        this.pileType = pileType;
        this.pileIndex = pileIndex;
    }

    override setTexture(frame: string) : this
    {
        super.setTexture('cards', 'cards/' + frame + '.png')
        return this;
    }

    getName() : string { return this.name;}

    // Additional methods to manipulate the card state...
}

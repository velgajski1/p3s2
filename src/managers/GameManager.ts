import Phaser from 'phaser';
import Card from '../elements/Card'; // Adjust import path as necessary
import PileManager from './PileManager';
import CardLayoutManager from './CardLayoutManager';
import { Rank, Suit } from './CardNameManager';
import ControlManager from './ControlManager';
import UndoManager from './UndoManager';
import { STOCK_COORDS } from '../config/Consts';
import { AUTOFINISH_MODE_ACTIVE, loadSettings, setDragActive } from '../config/Config';
import statsManager from './StatsManager';
import StatsManager from './StatsManager';

export class GameManager {

    private static instance: GameManager | null = null;
    private score: number = 0;
    private startTime: number;
    private elapsedTime: number = 0;
    private gameScene: Phaser.Scene;
    private moves: number = 0;

    public pileManager: PileManager;
    public layoutManager: CardLayoutManager;
    private deck: Card[] = [];

    private gameplayContainer: Phaser.GameObjects.Container;
    controlManager: ControlManager;
    quickTimeEvent: Phaser.Time.TimerEvent;

    public static gameScene : Phaser.Scene 
    static rendererHeight: number;
    static gameplayContainerY: number;
    static gameplayContainerScale: number;
    gameOverFlag : boolean = false
    wonscene: Phaser.Scenes.ScenePlugin;
    firstClickDone: boolean = false;
    static isMobile: boolean = false;
    static isPotrait: boolean = false;
    

    constructor(gameScene: Phaser.Scene, gameplayContainer: Phaser.GameObjects.Container) {
        
    
        
        GameManager.instance = this;
        UndoManager.init(gameScene, this)
        UndoManager.getInstance().enableUndo()
        this.gameScene = gameScene;
        this.startTime = Date.now();
        this.gameplayContainer = gameplayContainer;
        GameManager.gameScene = gameScene;

        // Initialize the managers responsible for handling piles and layout
        statsManager.startGame()

        this.pileManager = new PileManager(this.gameplayContainer, this);
        this.layoutManager = this.pileManager.cardLayoutManager;
        this.controlManager = new ControlManager(this.pileManager);

        // Set up a timer event to update the elapsed time in the game loop
        this.gameScene.time.addEvent({
            delay: 1000,
            callback: this.updateTimer,
            callbackScope: this,
            loop: true
        });      
        
        // this.gameScene.time.addEvent({
        //     delay: 1000,
        //     callback: () => {
        //         this.gameScene.scene.launch("WonScene", { score: this.getCurrentScore(), timeplayed : this.getElapsedTime(), timebonus : this.getTimeBonus(), totalscore : this.getTotalScore() } ).bringToTop("WonScene");
        //     },
        //     callbackScope: this,
        //     loop: false
        // });



        this.addQuickTimeEvent()

        this.gameScene.time.addEvent({
            delay: 10,
            callback:  () => {
                // this.pileManager.getWastePile().forEach(c => c.renewWasteCoords(this.controlManager))
                this.pileManager.getAllCards().forEach(c => c.update())
                this.gameplayContainer.sort('depth');
                setDragActive(this.controlManager.dragging);
                // if (this.gameScene.game.loop.actualFps < 59)  
                // if (!this.controlManager.activeCard && !this.gameScene.input.activePointer.isDown) {
                    
                // }
                
            },
            callbackScope: this,
            loop: true
        });

    }

    public addQuickTimeEvent()
    {
        this.quickTimeEvent = this.gameScene.time.addEvent({
            delay: 200,
            callback: this.updateTimerQuick,
            callbackScope: this,
            loop: true
        });        

        
        
    }

    setScore(score: number)
    {
        this.score = score;
    }

    public static getInstance(scene: Phaser.Scene, container : Phaser.GameObjects.Container): GameManager {
        if (this.instance == null) {
            this.instance = new GameManager(scene, container);
        }else {
            
        }

        return this.instance;
    }



    startGame(): void {
        this.score = 0;
        this.moves = 0;
        this.startTime = Date.now();
        this.elapsedTime = 0;

        // Reset other game states and initialize the deck
        this.createAndShuffleDeck();
        this.layoutInitialCards();
        this.controlManager.setupControls()
    }

    incrementScore(amount: number): void {
        this.score += amount;
    }

    incrementMoves(): void {
        this.moves++;
    }

    updateTimer(): void {
        if (this.gameOverFlag || !this.firstClickDone) {
            if (!this.firstClickDone) { this.startTime = Date.now() }
            return;
        } 
        this.elapsedTime = Math.floor((Date.now() - this.startTime) / 1000);
        statsManager.updateCurrentGame(this.score, this.elapsedTime);
        


    }   
    
    updateTimerQuick(): void {
        
        
        
     
        GameManager.rendererHeight = this.gameScene.renderer.height;
        GameManager.gameplayContainerY = this.gameplayContainer.y
        GameManager.gameplayContainerScale = this.gameplayContainer.scale;
        
        
        this.pileManager.fixTableuDepthAndFlipstatus()
        this.pileManager.getWastePile().forEach(c => {
            c.setFaceUp(true)
        });

        if (AUTOFINISH_MODE_ACTIVE && this.pileManager.allCardsUncovered() && this.pileManager.getWastePile().length <= 1 && this.pileManager.getStockPile().length == 0)
        {
            UndoManager.getInstance().disableUndo()
            this.controlManager.disableControls()
            this.layoutManager.stockIndicator.removeAllListeners()
            let wasteTop = this.pileManager.getTopCardFromWaste();
            if (wasteTop)
            {
                if (this.pileManager.moveCardToFoundationIfPossible(wasteTop, -1, true)) return;
            } 
            this.pileManager.getTableauPiles().some((pile, index) => {
                if (this.pileManager.moveTopCardTableauToFoundation(index)) return true;
            });


        }

        if ( !this.gameOverFlag && this.pileManager.getTableauPiles().every(pile => pile.length == 0) &&  this.pileManager.allCardsUncovered() && this.pileManager.getWastePile().length < 1 && this.pileManager.getStockPile().length == 0) {
            this.gameScene.scene.launch("WonScene", { score: this.getCurrentScore(), timeplayed : this.getElapsedTime(), timebonus : this.getTimeBonus(), totalscore : this.getTotalScore() } ).bringToTop("WonScene");
            this.controlManager.disableControls()
            this.gameOverFlag = true
        }

    }
    getTotalScore()
    {
       return this.getCurrentScore() + this.getTimeBonus();
    }
    getTimeBonus()
    {
        return  Math.floor(700000/ this.getElapsedTime());
    }

    restart() {
        
        GameManager.removeInstance();
        UndoManager.removeInstance()
        GameManager.instance = null;
        this.gameScene.events.emit('restartScene');
    }

    updateStats() {
      
        statsManager.updateStatsAfterGame(false, this.getCurrentScore(), this.getElapsedTime());
    }

    static removeInstance()
    {    
        this.instance = null 
    }

    getElapsedTime(): number {
        return this.elapsedTime;
    }

    getCurrentScore(): number {
        return this.score;
    }

    getMoves(): number {
        return this.moves;
    }

    reset() {
        this.moves = this.score = this.elapsedTime = 0;
        this.startTime = Date.now()
        this.gameOverFlag = false;
        this.firstClickDone = false;
    }

    // Create and shuffle the deck
    // Update the createAndShuffleDeck method to use the Suit and Rank enums
    private createAndShuffleDeck() {
        const suits = [Suit.Clubs, Suit.Diamonds, Suit.Hearts, Suit.Spades];
        const ranks = [
            Rank.Two, Rank.Three, Rank.Four, Rank.Five, Rank.Six, Rank.Seven,
            Rank.Eight, Rank.Nine, Rank.Ten, Rank.Jack, Rank.Queen, Rank.King, Rank.Ace
        ];

        // Create cards for each suit and rank combination
        for (const suit of suits) {
            for (const rank of ranks) {
                const card = new Card(this.gameScene, 0, 0, suit, rank, true ); // Adjust parameters as needed
                this.gameplayContainer.add(card)
                this.deck.push(card);
            }
        }

        // Shuffle the deck
        this.deck = this.shuffleDeck(this.deck);
    }

    // Shuffle the deck (using the Fisher-Yates algorithm)
    private shuffleDeck(deck: Card[]): Card[] {
        for (let i = deck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [deck[i], deck[j]] = [deck[j], deck[i]];
        }
        return deck;
    }

    // Lay out the cards in the initial game arrangement
    private layoutInitialCards() {
        this.layoutManager.init(this.pileManager)
        // Use the pile manager to distribute cards and the layout manager to arrange them
        this.layoutManager.addFoundationIndicators(this.gameScene,this.gameplayContainer)
        this.layoutManager.addTableuIndicators(this.gameScene,this.gameplayContainer)
        this.layoutManager.addWasteIndicator(this.gameScene,this.gameplayContainer)
        this.layoutManager.addStockIndicator(this.pileManager, this.gameScene,this.gameplayContainer)

        this.pileManager.distributeCardsToPiles(this.deck);
        // this.pileManager.distributeCardsToPilesEndGame(this.deck)

        this.layoutManager.layoutTableauPiles(this.pileManager.getTableauPiles());
        this.layoutManager.layoutFoundationPiles(this.pileManager.getFoundationPiles());
        this.layoutManager.layoutStockPile(this.pileManager.getStockPile())
        this.layoutManager.layoutWastePile(this.pileManager.getWastePile())

        
        
        UndoManager.getInstance().saveState(this.pileManager.getState())
        
    }
}

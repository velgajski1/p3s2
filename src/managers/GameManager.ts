import Phaser from 'phaser';
import Card from '../elements/Card'; // Adjust import path as necessary
import PileManager from './PileManager';
import CardLayoutManager from './CardLayoutManager';
import { Rank, Suit } from './CardNameManager';

export class GameManager {
    private static instance: GameManager | null = null;
    private score: number = 0;
    private startTime: number;
    private elapsedTime: number = 0;
    private gameScene: Phaser.Scene;
    private moves: number = 0;

    public pileManager: PileManager;
    private layoutManager: CardLayoutManager;
    private deck: Card[] = [];

    private gameplayContainer: Phaser.GameObjects.Container;

    constructor(gameScene: Phaser.Scene, gameplayContainer: Phaser.GameObjects.Container) {
        GameManager.instance = this;
        this.gameScene = gameScene;
        this.startTime = Date.now();
        this.gameplayContainer = gameplayContainer;

        // Initialize the managers responsible for handling piles and layout
        this.pileManager = new PileManager(this.gameplayContainer);
        this.layoutManager = new CardLayoutManager();

        // Set up a timer event to update the elapsed time in the game loop
        this.gameScene.time.addEvent({
            delay: 1000,
            callback: this.updateTimer,
            callbackScope: this,
            loop: true
        });

        this.gameScene.time.addEvent({
            delay: 10,
            callback: this.updateTimerQuick,
            callbackScope: this,
            loop: true
        });

    }

    public static getInstance(scene: Phaser.Scene, container : Phaser.GameObjects.Container): GameManager {
        if (this.instance === null) {
            this.instance = new GameManager(scene, container);
        }
        return this.instance;
    }

    setupStockInteraction(stockCardSprite: Phaser.GameObjects.Sprite) {
        // Make the stock card interactive
        stockCardSprite.setInteractive();
        stockCardSprite.on('pointerdown', () => {
            this.pileManager.moveTopCardStockToWaste(); // Move the card from stock to waste
            this.updateWasteLayout(); // Update the visual layout of the waste pile
        });
    }

    // Update the layout of the waste pile to reflect the latest top card
    updateWasteLayout() {
        this.layoutManager.layoutWastePile( this.pileManager.getWastePile() ); // Adjust x, y to desired coordinates
    }

    startGame(): void {
        this.score = 0;
        this.moves = 0;
        this.startTime = Date.now();
        this.elapsedTime = 0;

        // Reset other game states and initialize the deck
        this.createAndShuffleDeck();
        this.layoutInitialCards();
    }

    incrementScore(amount: number): void {
        this.score += amount;
    }

    incrementMoves(): void {
        this.moves++;
    }

    updateTimer(): void {
        this.elapsedTime = Math.floor((Date.now() - this.startTime) / 1000);


    }   
    
    updateTimerQuick(): void {

        this.gameplayContainer.sort('depth');

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
        // Use the pile manager to distribute cards and the layout manager to arrange them
        this.layoutManager.addFoundationIndicators(this.gameScene,this.gameplayContainer)
        this.layoutManager.addWasteIndicator(this.gameScene,this.gameplayContainer)
        this.layoutManager.addStockIndicator(this.pileManager, this.gameScene,this.gameplayContainer)
        this.pileManager.distributeCardsToPiles(this.deck);
        this.layoutManager.layoutTableauPiles(this.pileManager.getTableauPiles());
        this.layoutManager.layoutFoundationPiles(this.pileManager.getFoundationPiles());
        this.layoutManager.layoutStockPile(this.pileManager.getStockPile())
        this.layoutManager.layoutWastePile(this.pileManager.getWastePile())
        
    }
}

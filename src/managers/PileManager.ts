import { Game } from "phaser";
import { FOLD_PIXELS_RATE, FOUNDATION_COORDS_DELTA, FOUNDATION_COORDS_INIT, PileType, STOCK_COORDS, TABLEU_COORDS_DELTA, TABLEU_COORDS_INIT, TABLEU_FOLD_HEIGHT, WASTE_DELTA_FROM_STOCK } from "../config/Consts";
import Card from "../elements/Card";
import { GameState } from "../utils/types";
import CardLayoutManager from './CardLayoutManager';
import getRankValue, { Rank, Suit } from "./CardNameManager";
import CardTransitionManager from "./CardTransitionManager";
import { GameManager } from "./GameManager";
import UndoManager from "./UndoManager";
import { RIGHT_HANDED_MODE_IDX, SOUND_ACTIVE, STOCK_THREE_MODE_ACTIVE } from "../config/Config";
import ControlManager from "./ControlManager";
import statsManager from "./StatsManager";
import { SoundManager } from "./SoundManager";


export default class PileManager {





    static substackId : number = 0;


    gameManager: GameManager;

    

    private tableauPiles: Array<Array<Card>>;
    private foundationPiles: Array<Array<Card>>;
    private stockPile: Array<Card>;
    private wastePile: Array<Card>;
    private transitionPile : Array<Card>;
    private tableuPilesYDelta : Array<number>;

    cardLayoutManager: CardLayoutManager;
    gameplayContainer: Phaser.GameObjects.Container;
    cardTransitionManager : CardTransitionManager;
    static foldYDelta: number = 1;

    constructor(gameplayContainer : Phaser.GameObjects.Container, gameManager : GameManager) {
        
        this.initializeNormal(gameplayContainer, gameManager);

        this.cardLayoutManager = new CardLayoutManager();
        this.cardTransitionManager = new CardTransitionManager();
    }


    initializeNormal(gameplayContainer : Phaser.GameObjects.Container, gameManager : GameManager) {
        // Initialize empty tableau piles (7 in total)
        this.gameplayContainer = gameplayContainer;
        this.gameManager = gameManager;
        this.tableauPiles = Array.from({ length: 7 }, () => []);
        this.tableuPilesYDelta = Array.from({length:7}, () => TABLEU_COORDS_DELTA.y)

        // Initialize empty foundation piles (4 in total, one per suit)
        this.foundationPiles = Array.from({ length: 4 }, () => []);

        // Initialize empty stock and waste piles
        this.stockPile = [];
        this.wastePile = [];
        this.transitionPile = [];
    }

    handleWasteClicked(card: Card) : boolean
    {
        
        const topWasteCard = card;
        if (topWasteCard) {
            if (this.moveCardToFoundationIfPossible(topWasteCard)) {
                this.cardLayoutManager.init(this)
                this.cardLayoutManager.layoutWastePile(this.getWastePile()) 
                UndoManager.getInstance().saveState(this.getState())
                
                return true;
            }
            for (let i = 0; i < this.tableauPiles.length; i++) {
                const targetPile = this.tableauPiles[i];
                if (this.canMoveToTableauPile(topWasteCard, targetPile)) {
                    this.fixTableuYDelta(i, [topWasteCard])
                   
                    this.cardLayoutManager.init(this)

                    this.gameManager.incrementScore(5)
                    // this.gameManager.incrementMoves()
                   
                    this.cardLayoutManager.layoutTableauPile(this.tableauPiles, i, true)
                    this.addCardToTableuPile(topWasteCard, i);
                    this.cardLayoutManager.layoutWastePile(this.getWastePile()) 
                    UndoManager.getInstance().saveState(this.getState())
                    return true; // Card moved, so no further action is required
                }
            }
            
        }
        this.cardLayoutManager.init(this)
        this.cardLayoutManager.layoutWastePile(this.getWastePile()) 
        UndoManager.getInstance().saveState(this.getState())
        return false
    }
    public getTableuPileIndexFromCard(card: Card): number {
        return this.tableauPiles.findIndex(pile => pile.includes(card));
    }    
    
    public getFoundationPileIndexFromCard(card: Card): number {
        return this.foundationPiles.findIndex(pile => pile.includes(card));
    }

    public getSubstack(card: Card) : Card[] {
        if (card.isOnTableu()==false)
        {
            return [];
        } 
        const tableuPile = this.tableauPiles[card.pileIndex]
        const startIndex = tableuPile.indexOf(card);
        const substack = tableuPile.slice(startIndex);
        return substack;
    }

    public removeSubstack(tableuPile : Card[], card : Card) : void {
        tableuPile.splice(tableuPile.indexOf(card));
    }

    allCardsUncovered() : boolean
    {
        return this.tableauPiles.every(pile => pile.every(card => card.isFaceUp));
    }





    // Method to handle clicks on a tableau card
    handleTableauClicked(card: Card) : boolean {
      
        const pileIndex = card.pileIndex;
        
        // Ensure the index is valid
        if (pileIndex >= 0 && pileIndex < this.tableauPiles.length) {
            const tableauPile = this.tableauPiles[pileIndex];

            // Step 1: Check if the card can move to the foundation
            if (this.moveCardToFoundationIfPossible(card)) {
                if (tableauPile.length > 0) {
                    this.uncoverTableuPile(pileIndex);
                    this.fixTableuYDelta(pileIndex)
                    this.cardLayoutManager.init(this)
                    this.cardLayoutManager.layoutTableauPile(this.getTableauPiles(), pileIndex, true)
                }


                UndoManager.getInstance().saveState(this.getState())
                return true; // Card moved to foundation, so no further action is required
            }

            // Step 2: Check if the card can move to another tableau pile
            for (let i = 0; i < this.tableauPiles.length; i++) {
                if (i !== pileIndex) {
                    const targetPile = this.tableauPiles[i];
                    if (this.canMoveToTableauPile(card, targetPile)) {
                        // Identify the substack starting from the clicked card to the end
                        const substack = this.getSubstack(card);
                        this.fixTableuYDelta(i, substack)
                        this.cardLayoutManager.init(this)
                        this.cardLayoutManager.layoutTableauPile(this.tableauPiles, i, true)
                        

                        card.substackid = PileManager.substackId++;
                        // Move the substack to the new tableau pile using the transition manager
                        substack.forEach((movingCard, subIndex) => {
                            movingCard.substackid = PileManager.substackId;
                            this.addCardToTableuPile(movingCard, i);
                        });
    
                        // Remove the moved substack from the original pile
                        this.removeSubstack(tableauPile, card)

                        this.fixTableuYDelta(pileIndex)
                        this.cardLayoutManager.init(this)
                        this.cardLayoutManager.layoutTableauPile(this.tableauPiles, pileIndex, true)
    
                        // Uncover the top card of the original pile, if any
                        // 
                        if (targetPile.length > 0) {
                            this.uncoverTableuPile(pileIndex);
                            
                            // this.cardLayoutManager.layoutTableauPile(this.getTableauPiles(), card.pileIndex, true)
                        }
    
                        UndoManager.getInstance().saveState(this.getState())
                        return true; // Cards moved, so no further action is required
                    }
                }
            }
        } else {
            console.warn('Invalid pile index');
        }
        return false
    }


    moveTopCardTableauToFoundation(pileIndex: number) {
        const card = this.getTopCardFromTableau(pileIndex);
        if (card) {
            if (this.moveCardToFoundationIfPossible(card, -1, true))
            {
                this.gameManager.incrementScore(10)
                // this.gameManager.incrementMoves()
                this.uncoverTableuPile(pileIndex);
                this.fixTableuYDelta(card.pileIndex)
                UndoManager.getInstance().saveState(this.getState())
                return true;
            }
        }
        return false;
    }
    uncoverTableuPile(pileIndex: number)
    {
        
        // Retrieve the pile by index
        const tableauPile = this.tableauPiles[pileIndex];
        if (tableauPile && tableauPile.length > 0) {
            // Get the top card
            const topCard = tableauPile[tableauPile.length - 1];
            
            if (!topCard.isFaceUp){
                this.cardTransitionManager.flipCard(topCard, 120);
                this.gameManager.incrementScore(5)
            }
        }
    }

    moveAllCardsFromWasteToStock() {
        // this.gameManager.incrementMoves()
        this.cardTransitionManager.moveAllCardsFromWasteToStock(this.stockPile, this.wastePile, this.gameplayContainer);
        UndoManager.getInstance().saveState(this.getState())
    }
    
    // Move the top card from the stock pile to the waste pile
    moveTopCardStockToWaste() {
        if (STOCK_THREE_MODE_ACTIVE) {
            
            const cards : Card[] = this.getTopStockCards(3)
            cards.reverse()
            cards.forEach( (card, index) => {
                this._addCardToWaste(card);
                SOUND_ACTIVE && SoundManager.instance.valid.play()
                // this.cardTransitionManager.moveTopCardStockToWaste(card, index, this.stockPile, this.wastePile, this.gameplayContainer, () => this._addCardToWaste(card));
                card.setFaceUp(true);
            })
            // setTimeout(() => {
                this.cardLayoutManager.layoutWastePile(this.getWastePile(), false) 
            // }, 1);
        } else {
            const card = this.getTopStockCard();
            if (card) {
                this._addCardToWaste(card);
                this.cardTransitionManager.moveTopCardStockToWaste(card, 0, this.stockPile, this.wastePile, this.gameplayContainer, () => this._addCardToWaste(card));
                card.setFaceUp(true);
                
            }
        }
        UndoManager.getInstance().saveState(this.getState())
        // this.gameManager.incrementMoves()


       
    }


    public canMoveCardToFoundation(card: Card, foundationIdx: number = -1): boolean {
        // Verify that the card is on top of its tableau pile
        if (card.pileType === PileType.Tableau) {
            const tableauPile = this.tableauPiles[card.pileIndex];
            const isTopCard = tableauPile.length > 0 && tableauPile[tableauPile.length - 1] === card;
    
            // If the card isn't on top of its tableau pile, return false
            if (!isTopCard) {
                return false;
            }
        }
    
        const pileIndex = foundationIdx === -1 ? this.getFoundationPileIndex(card.suit) : foundationIdx;
        if (pileIndex === -1 || !this.canPlaceInFoundation(card)) {
            return false;
        }
        return true;
    }
    
    public moveCardToFoundationIfPossible(card: Card, foundationIdx: number = -1, skipLayoutAll: boolean = false): boolean {
        // Check if the card can be moved to the foundation
        if (!this.canMoveCardToFoundation(card, foundationIdx)) {
            return false;
        }
    
        const pileIndex = foundationIdx === -1 ? this.getFoundationPileIndex(card.suit) : foundationIdx;
    
        // Determine the foundation pile and its coordinates
        const foundationPile = this.foundationPiles[pileIndex];
        const targetX = FOUNDATION_COORDS_INIT.x[RIGHT_HANDED_MODE_IDX] + pileIndex * FOUNDATION_COORDS_DELTA.x[RIGHT_HANDED_MODE_IDX]; // Adjust base coordinates
        const targetY = FOUNDATION_COORDS_INIT.y;
    
        // this.gameManager.incrementMoves()
        if (card.pileType == PileType.Waste) {
            this.gameManager.incrementScore(10);
        } 
        else if (card.pileType == PileType.Tableau) {
            this.gameManager.incrementScore(10);
        }

        // Call the transition manager to handle the movement
        card.setFaceUp(true);
        this.cardTransitionManager.moveCardToFoundation(
            card,
            targetX,
            targetY,
            foundationPile,
            foundationPile.length,
            this.gameplayContainer,
            () => {
                this.removeCardFromTransition(card);
                this._addCardToFoundation(card, pileIndex);
                if (!skipLayoutAll) {
                    // this.fixTableuYDeltaAll();
                    // this.cardLayoutManager.layoutAll(this, true);
                }
                this.fixFoundationLayering();
            }
        );
    
        this._addCardToTransition(card);
        this._addCardToFoundation(card, pileIndex);
    
        return true;
    }
    

    getTopStockCard(): Card | undefined {
        
        return this.stockPile[this.stockPile.length - 1];
    }

    getTopStockCards(num: number = 3): Card[] {
        const numberOfCardsToRetrieve = Math.min(num, this.stockPile.length);
        return this.stockPile.slice(-numberOfCardsToRetrieve);
    }

   // Distribute the deck into piles based on Klondike Solitaire rules
   distributeCardsToPiles(deck: Card[]) {
        // Fill each of the seven tableau piles incrementally
        for (let i = 0; i < 7; i++) {
            for (let j = 0; j <= i; j++) {
                const card = deck.shift(); // Remove the card from the deck
                if (card) {
                    card.setFaceUp(j === i); // Only the top card in each pile is face-up
                    this._addCardToTableau(card, i);
                    
                    
                }
            }
        }
        
        deck.forEach(x => this._addCardToStock(x));
    }
     sortDeckByRank(deck: Card[]): Card[] {
        return deck.sort((a, b) => a.rank - b.rank);
    }

    distributeCardsToPilesEndGame(deck: Card[]) {
        // Define the suit order for foundation piles
        const suits: Suit[] = [Suit.Clubs, Suit.Diamonds, Suit.Hearts, Suit.Spades];
        deck = this.sortDeckByRank(deck)
    
        while (deck.length > 0) {
            const card = deck.shift(); // Take the top card from the deck
            if (!card) continue; // If by some reason there's no card, continue to the next iteration
    
            if ((card.rank === Rank.King || card.rank == Rank.Queen) && this.stockPile.length < 8) {
                // Place Kings and Queens in the stock pile
                // card.setFaceUp(false);  // Kings and Queens should be facedown in the stock
                this._addCardToStock(card)
            } else if (card.rank <= Rank.Jack) {
                // Check if the card can be placed in the foundation (i.e., is the next card in sequence)
                this._addCardToFoundation(card, card.suit)
            }
        }
    
        // Optionally shuffle the stock pile to prevent predictable outcomes
        // this.shufflePile(this.stockPile);
    }
    
    // Tableau Management


    getCardFromTableau(pileIndex: number, cardIndex: number): Card | undefined {
        return this.tableauPiles[pileIndex][cardIndex];
    }

    getTopCardFromTableau(pileIndex: number): Card | undefined {
        const pile = this.tableauPiles[pileIndex];
        return pile.length > 0 ? pile[pile.length - 1] : undefined;
    }





    getTopCardFromFoundation(pileIndex: number): Card | undefined {
        const pile = this.foundationPiles[pileIndex];
        return pile.length > 0 ? pile[pile.length - 1] : undefined;
    }


    // Stock and Waste Management



    drawCardFromStock(): Card | undefined {
        return this.stockPile.pop();
    }




    getTopCardFromWaste(): Card | undefined {
        return this.wastePile.length > 0 ? this.wastePile[this.wastePile.length - 1] : undefined;
    }


    // Counting Cards in Piles
    countCardsInTableau(): number {
        return this.tableauPiles.reduce((count, pile) => count + pile.length, 0);
    }

    countCardsInFoundation(): number {
        return this.foundationPiles.reduce((count, pile) => count + pile.length, 0);
    }

    countCardsInStock(): number {
        return this.stockPile.length;
    }

    countCardsInWaste(): number {
        return this.wastePile.length;
    }

    getTableauPiles(): Array<Array<Card>> {
        return this.tableauPiles;
    }

    getFoundationPiles(): Array<Array<Card>> {
        return this.foundationPiles;
    }

    getStockPile(): Card[] {
        return this.stockPile;
    }

    getWastePile(): Card[] {
        return this.wastePile;
    }

    calculateTableuPileHeight(pileIndex : number, tabCoordsDeltaY :number, tabCoordsDeltaYCovered : number, substack : Card[] = []): number {
        let targetPile = this.tableauPiles[pileIndex];
        let yPosition = TABLEU_COORDS_INIT.y;
        for (let i = 0; i < targetPile.length; i++) {
            if (targetPile[i].isFaceUp) {
                yPosition += tabCoordsDeltaY;
            } else {
                yPosition += tabCoordsDeltaYCovered;
            }
        }
        for (let i = 0; i < substack.length; i++) {
            if (substack[i].isFaceUp) {
                yPosition += tabCoordsDeltaY;
            } else {
                yPosition += tabCoordsDeltaYCovered;
            }
        }
        return yPosition;

    }

    fixTableuYDeltaAll() {
        this.tableuPilesYDelta.forEach((x,i) => this.fixTableuYDelta(i));
    }

    fixTableuYDelta(pileIndex: number, substack : Card[] = [], maxTries : number = 50) : number
    {
        maxTries--;
        if (maxTries <= 0) return this.tableuPilesYDelta[pileIndex];
        let height = this.calculateTableuPileHeight(pileIndex, this.tableuPilesYDelta[pileIndex], TABLEU_COORDS_DELTA.y_covered, substack)+30;
        
        let x = (GameManager.rendererHeight - GameManager.gameplayContainerY - GameManager.gameplayContainerScale*height);
        
        if (x > 20 && this.tableuPilesYDelta[pileIndex] < TABLEU_COORDS_DELTA.y) {
            this.tableuPilesYDelta[pileIndex] =  this.tableuPilesYDelta[pileIndex] + 1;
            return this.fixTableuYDelta(pileIndex, substack, maxTries);

        }
        else if (x < 0) {
            this.tableuPilesYDelta[pileIndex] =  this.tableuPilesYDelta[pileIndex] - 1;
            return this.fixTableuYDelta(pileIndex, substack, maxTries);
        }
        else
        {
            // 
            return this.tableuPilesYDelta[pileIndex];
        }

       
    };

    getTableuCardsDeltaYForPile(pileIndex : number) : number {

        return this.tableuPilesYDelta[pileIndex];
    }

    // Check if a card can be placed in the target tableau pile according to Klondike rules
    public canMoveToTableauPile(card: Card, targetPile: Array<Card>): boolean {
        // According to Klondike rules, cards should be placed in descending order and alternating colors
        if (targetPile.length == 0) {
            return card.rank == Rank.King; // Empty tableau piles can only accept Kings
        }

        const topCard = targetPile[targetPile.length - 1];
        let ret = (getRankValue(topCard.rank) == getRankValue(card.rank) + 1) && (this.isOppositeColor(card.suit, topCard.suit));

        return ret;
    }

    // Check if two suits have opposite colors
    private isOppositeColor(suit1: Suit, suit2: Suit): boolean {
        const redSuits = [Suit.Hearts, Suit.Diamonds];
        const blackSuits = [Suit.Clubs, Suit.Spades];

        return (redSuits.includes(suit1) && blackSuits.includes(suit2)) ||
               (blackSuits.includes(suit1) && redSuits.includes(suit2));
    }

    // Example method to get the target coordinates of a tableau pile
    private getTableauPileCoordinates(pileIndex: number): { x: number, y: number } {
        // Return the base coordinates of the target pile according to your layout
        return { x: 100 + pileIndex * 120, y: 200 }; // Adjust as needed
    }

    // Check if a card can be placed in the foundation pile based on game rules
    private canPlaceInFoundation(card: Card): boolean {
        // Find the foundation pile matching the card's suit
        const pileIndex = this.getFoundationPileIndex(card.suit);
        if (pileIndex == -1) {
            return false;
        }
        const foundationPile = this.foundationPiles[pileIndex];
        // Check if the foundation pile is empty and requires an Ace to start
        if (foundationPile.length === 0) {
            return getRankValue(card.rank) === 1; // Ace starts the pile
        }


        // Check if the card is the next in ascending order
        const topCard = foundationPile[foundationPile.length - 1];

      

        return getRankValue(card.rank) === getRankValue(topCard.rank) + 1;
    }

    public getFoundationPileIndex(suit: Suit): number {
        let firstEmptyIndex = -1;  // Initialize to keep track of the first empty index
    
        // Iterate over the foundation piles to check for the existing suit or record the first empty pile
        for (let i = 0; i < this.foundationPiles.length; i++) {
            const pile = this.foundationPiles[i];
            if (pile.length > 0) {
                if (pile[0].suit === suit) {
                    return i;  // Return index if the suit is already in a pile
                }
            } else if (firstEmptyIndex === -1) {
                firstEmptyIndex = i;  // Record the first empty index
            }
        }
    
        // If the suit was not found but there is an empty pile, return its index
        return firstEmptyIndex;
    }
    

    // Remove the card from whichever pile it currently belongs to
    private removeCardFromCurrentPile(card: Card): void {
        switch (card.pileType) {
            case PileType.Waste:
                this.wastePile = this.wastePile.filter(c => c !== card);
                break;
            case PileType.Stock:
                this.stockPile = this.stockPile.filter(c => c !== card);
                break;
            case PileType.Foundation:
                const foundationPile = this.foundationPiles[card.pileIndex];
                this.foundationPiles[card.pileIndex] = foundationPile.filter(c => c !== card);
                break;
            case PileType.Tableau:
                const tableauPile = this.tableauPiles[card.pileIndex];
                this.tableauPiles[card.pileIndex] = tableauPile.filter(c => c !== card);
                break;
            case PileType.Transition:
                this.transitionPile = this.transitionPile.filter(c => c !== card);

        }
    }

    private addCardToPile(card: Card, pileType: PileType, pileIndex: number): void {
        // Remove the card from its current pile

        this.removeCardFromCurrentPile(card);

        // Add to the new pile
        card.setPileType(pileType);
        card.pileIndex = pileIndex;
        let newLen = 0;

        switch (pileType) {
            case PileType.Waste:
                newLen = 1000+this.wastePile.push(card);
                break;
            case PileType.Stock:
                newLen = this.stockPile.push(card);
                break;
            case PileType.Foundation:
                newLen = this.foundationPiles[pileIndex].push(card);
                break;
            case PileType.Tableau:
                newLen = pileIndex*100 + this.tableauPiles[pileIndex].push(card) - 1;
                break;
        }

        if (card.inTransition) newLen += 20000;
       
        card.setDepth(newLen);
        this.gameplayContainer.sort("depth");

           
    
    }

    public getState() : GameState {
        return {
            tableauPiles: this.getTableauPiles(),
            foundationPiles: this.getFoundationPiles(),
            stockPile: this.getStockPile(),
            wastePile: this.getWastePile(),
            flippedCounts :[],
            score : this.gameManager.getCurrentScore()
            // Include other elements of the game state
        }
    }


    public addCardToTableuPile(card: Card, pileIndex: number) {
        let targetPile = this.tableauPiles[pileIndex];

        
        this.cardTransitionManager.moveCardToTableau(
            this.getTableuCardsDeltaYForPile(pileIndex),
            this.getTableauPiles(),
            card,
            pileIndex,
            targetPile.length,
            this.gameplayContainer,
            () => {
                this.removeCardFromTransition(card);
                this._addCardToTableau(card, pileIndex);
                // this.cardLayoutManager.layoutAll(this, true)
                this.fixTableuDepthAndFlipstatus()
                this.gameplayContainer.sort("depth");
                
                
            }
        );

        // Remove the card from the waste pile after moving
        this._addCardToTransition(card)
        this._addCardToTableau(card, pileIndex);
        card.setInteractive(false);
        
    }
    


    public addCardToFoundationPile(card: Card, foundationIndex: number) {
        


        // Retrieve the target foundation pile using the provided index
        let targetPile : Card[] = this.foundationPiles[foundationIndex];


        // Call the transition manager to animate the card moving to the foundation pile
        this.cardTransitionManager.moveCardToFoundation(
            card,
            FOUNDATION_COORDS_INIT.x[RIGHT_HANDED_MODE_IDX] + foundationIndex * FOUNDATION_COORDS_DELTA.x[RIGHT_HANDED_MODE_IDX], // X position of the foundation pile
            FOUNDATION_COORDS_INIT.y, // Y position of the foundation pile
            targetPile, // Depth in the pile
            targetPile.length,
            this.gameplayContainer,
            () => {
                // Callback after the transition is complete
                this.removeCardFromTransition(card);
                this._addCardToFoundation(card, foundationIndex);
                // this.fixTableuYDeltaAll();
                // this.cardLayoutManager.layoutAll(this, true)
                this.fixFoundationLayering()
            }
        );
    
        // Add the card to the transition state to manage its state during the animation
        this._addCardToTransition(card);
    
        // Immediately add the card to the foundation pile to update the game state
        this._addCardToFoundation(card, foundationIndex);
    
        // Disable further interactions with the card as it is now in a foundation pile
        card.setInteractive(false);
    }

    // Add a card to the foundation pile
    private _addCardToFoundation(card: Card, pileIndex: number) {
        this.addCardToPile(card, PileType.Foundation, pileIndex);
   
    }


    // Add a card to the tableau pile
    private _addCardToTableau(card: Card, pileIndex: number) {
     
        this.addCardToPile(card, PileType.Tableau, pileIndex);
    }

    // Add a card to the waste pile
    private _addCardToWaste(card: Card) {
        // 
        this.addCardToPile(card, PileType.Waste, 0); // Only one waste pile
    }

    // Add a card to the stock pile
    private _addCardToStock(card: Card) {
        this.addCardToPile(card, PileType.Stock, 0); // Only one stock pile
    }    
    
    // Add a card to the stock pile
    private _addCardToTransition(card: Card) {
        card.inTransition = true;
    }

    removeCardFromTransition(card : Card) {
        card.inTransition = false;
    }

    listTableauCardsWithDepthAndName(listOnlyFaceUp : boolean) {
        
        this.tableauPiles.forEach((pile, pileIndex) => {
            
            pile.forEach((card) => {
                const depth = card.depth; // Assuming `depth` is a property on Card
                const name = card.getName(); // Assuming `getName` is a method on Card
                const isfaceup = card.isFaceUp;
                if (listOnlyFaceUp && isfaceup) {
                    
                }
                else if (!listOnlyFaceUp) {
                    
                }
                
            });
        });

    }    
    
    listWasteCardsWithDepthAndName() {



            this.wastePile.forEach((card) => {
                const depth = card.depth; // Assuming `depth` is a property on Card
                const name = card.getName(); // Assuming `getName` is a method on Card
                
                
            });


    }

    listTransitionCardsWithDepthAndName() {
        this.transitionPile.forEach(card => {
            const depth = card.depth; // Assuming `depth` is a property on Card
            const name = card.getName(); // Assuming `getName` is a method on Card
            const isfaceup = card.isFaceUp;
            

        })
    }

    setToGameState(state: GameState): void {
        // Clear all current piles without affecting the cards themselves

        this.gameManager.setScore(state.score)
        
        this.clearPiles();

        // Rearrange cards according to the saved state
        state.tableauPiles.forEach((pile, pileIndex) => {
            pile.forEach(card => this.addCardToPile(card, PileType.Tableau, pileIndex));
            this.fixTableuYDelta(pileIndex);
        });
        state.foundationPiles.forEach((pile, pileIndex) => {
            pile.forEach(card => this.addCardToPile(card, PileType.Foundation, pileIndex));
        });
        state.stockPile.forEach(card => {
            
            this.addCardToPile(card, PileType.Stock, 0);
        });
        state.wastePile.forEach(card => {
            this.addCardToPile(card, PileType.Waste, 0);
            card.setFaceUp(true);
        });

        this.applyFlippedCounts(state.flippedCounts)
       
        this.gameManager.layoutManager.layoutAll(this)
        this.fixTableuDepthAndFlipstatus()
    }

    fixTableuDepthAndFlipstatus()
    {
        for (var i = 0; i < 7; i++) {
            let c = this.getTopCardFromTableau(i);
            if (c?.isFaceUp==false && c?.isBeingFlipped == false) 
            {
                c.setFaceUp(true);
            }
            
        }
        this.fixTableuDepth()
    }
    fixFoundationLayering()
    {
        this.getFoundationPiles().forEach(pile => {
            pile.forEach((card, index) => {
                if (card.inTransition == false){
                    
                    card.setDepth(getRankValue(card.rank))
                
                }  
            })
            pile.sort((a, b) => a.depth - b.depth);
        })
        
        this.gameplayContainer.sort("depth");
    }

    private applyFlippedCounts(flippedCounts: number[]): void {
        this.tableauPiles.forEach((pile, index) => {
            const count = flippedCounts[index] || 0; // Get the count of face-up cards or default to 0
            let faceUpCount = 0;
            // Traverse the pile from the top (end of the array) downwards
            for (let i = pile.length - 1; i >= 0; i--) {
                if (faceUpCount < count) {
                    // pile[i].isFaceUp = true;
                    pile[i].setFaceUp(true)
                    faceUpCount++;
                } else {
                    pile[i].setFaceUp(false); // Ensure cards above the last face-up are facedown if needed
                }
            }
        });
    }

    private clearPiles(): void {
        // Clear the arrays but keep the card objects in memory
        this.tableauPiles.forEach(pile => pile.length = 0);
        this.foundationPiles.forEach(pile => pile.length = 0);
        this.stockPile.length = 0;
        this.wastePile.length = 0;
    }

    fixTableuDepth()
    {
        this.getTableauPiles().forEach((pile, pileindex) => {
            pile.forEach((c, index) => {
                if (!c.isBeingFlipped && !c.inTransition && c.depth < 1000)
                {
                    c.setDepth(100*pileindex+index);
                }
                
            })
        })
    }

    getAllCards(): Card[] {
        // Combine all the piles into a single array
        return [
            ...this.stockPile,
            ...this.wastePile,
            ...this.transitionPile,
            ...this.tableauPiles.flat(),
            ...this.foundationPiles.flat()
        ];
    }

    // Additional utility methods like checking game rules, validating moves, etc.
}

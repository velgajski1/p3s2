import { FOUNDATION_COORDS_DELTA, FOUNDATION_COORDS_INIT, PileType, STOCK_COORDS, WASTE_DELTA_FROM_STOCK } from "../config/Consts";
import Card from "../elements/Card";
import CardLayoutManager from './CardLayoutManager';
import getRankValue, { Rank, Suit } from "./CardNameManager";
import CardTransitionManager from "./CardTransitionManager";
import { GameManager } from "./GameManager";


export default class PileManager {

    private tableauPiles: Array<Array<Card>>;
    private foundationPiles: Array<Array<Card>>;
    private stockPile: Array<Card>;
    private wastePile: Array<Card>;
    private transitionPile : Array<Card>;

    cardLayoutManager: any;
    gameplayContainer: Phaser.GameObjects.Container;
    cardTransitionManager : CardTransitionManager;

    constructor(gameplayContainer : Phaser.GameObjects.Container) {
        // Initialize empty tableau piles (7 in total)
        this.gameplayContainer = gameplayContainer;
        this.tableauPiles = Array.from({ length: 7 }, () => []);

        // Initialize empty foundation piles (4 in total, one per suit)
        this.foundationPiles = Array.from({ length: 4 }, () => []);

        // Initialize empty stock and waste piles
        this.stockPile = [];
        this.wastePile = [];
        this.transitionPile = [];

        this.cardLayoutManager = new CardLayoutManager();
        this.cardTransitionManager = new CardTransitionManager();
    }

    handleWasteClicked(card: Card)
    {
        
        const topWasteCard = card;
        if (topWasteCard) {
            for (let i = 0; i < this.tableauPiles.length; i++) {
                const targetPile = this.tableauPiles[i];
                if (this.canMoveToTableauPile(topWasteCard, targetPile)) {
                    this.cardTransitionManager.moveCardToTableau(
                        topWasteCard,
                        i,
                        targetPile.length,
                        this.gameplayContainer,
                        () => {
                            this.removeCardFromTransition(topWasteCard);
                            this.addCardToTableau(topWasteCard, i);
                            
                        }
                    );
    
                    // Remove the card from the waste pile after moving
                    this.addCardToTransition(topWasteCard)
                    this.addCardToTableau(topWasteCard, i);
                    topWasteCard.setInteractive(false);
                    
    
                    return; // Card moved, so no further action is required
                }
            }
        }
    }

    // Method to handle clicks on a tableau card
    handleTableauClicked(card: Card) {
      
        const pileIndex = card.pileIndex;

        // Ensure the index is valid
        if (pileIndex >= 0 && pileIndex < this.tableauPiles.length) {
            const tableauPile = this.tableauPiles[pileIndex];

            // Step 1: Check if the card can move to the foundation
            if (this.moveCardToFoundationIfPossible(card)) {
                return; // Card moved to foundation, so no further action is required
            }

            // Step 2: Check if the card can move to another tableau pile
            for (let i = 0; i < this.tableauPiles.length; i++) {
                if (i !== pileIndex) {
                    const targetPile = this.tableauPiles[i];
                    if (this.canMoveToTableauPile(card, targetPile)) {
                        // Identify the substack starting from the clicked card to the end
                        const startIndex = tableauPile.indexOf(card);
                        const substack = tableauPile.slice(startIndex);
    
                        
                        // Move the substack to the new tableau pile using the transition manager
                        substack.forEach((movingCard, subIndex) => {
                            console.log("subindex: ", subIndex)
                            this.cardTransitionManager.moveCardToTableau(
                                movingCard,
                                i,
                                targetPile.length,
                                this.gameplayContainer,
                                () => {
                                    let oldIdx = movingCard.pileIndex
                                    this.removeCardFromTransition(movingCard)
                                    this.addCardToTableau(movingCard, i);
                                    

                                }
                            );
                            this.addCardToTransition(movingCard);
                            this.addCardToTableau(movingCard, i);
                            
                        });
    
                        // Remove the moved substack from the original pile
                        tableauPile.splice(startIndex);
    
                        // Uncover the top card of the original pile, if any
                        if (tableauPile.length > 0) {
                            this.uncoverTableuPile(pileIndex);
                        }
    
                        return; // Cards moved, so no further action is required
                    }
                }
            }
        } else {
            console.warn('Invalid pile index');
        }
    }


    moveTopCardTableauToFoundation(pileIndex: number) {
        const card = this.getTopCardFromTableau(pileIndex);
        if (card) {
            if (this.moveCardToFoundationIfPossible(card))
            {
                this.uncoverTableuPile(pileIndex);
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
                this.cardTransitionManager.flipCard(topCard, 300);
            }
        }
    }

    moveAllCardsFromWasteToStock() {
        this.cardTransitionManager.moveAllCardsFromWasteToStock(this.stockPile, this.wastePile, this.gameplayContainer);
    }
    
    // Move the top card from the stock pile to the waste pile
    moveTopCardStockToWaste() {
        const card = this.getTopStockCard();
        if (card) {
            if (this.moveCardToFoundationIfPossible(card) == false)
            {
                this.addCardToWaste(card);
                this.cardTransitionManager.moveTopCardStockToWaste(card, this.stockPile, this.wastePile, this.gameplayContainer, () => this.addCardToWaste(card));
                card.setFaceUp(true);

            }
            else
            {
                let qTime = GameManager.getInstance(card.scene, card.parentContainer).quickTimeEvent;
                if (qTime) qTime.destroy();
                GameManager.getInstance(card.scene, card.parentContainer).addQuickTimeEvent();
            }
        }

       
    }
    // Move a card to the foundation if possible (using the transition manager)
    private moveCardToFoundationIfPossible(card: Card): boolean {
        // Verify that the card is on top of its tableau pile
        if (card.pileType === PileType.Tableau) {
            const tableauPile = this.tableauPiles[card.pileIndex];
            const isTopCard = tableauPile.length > 0 && tableauPile[tableauPile.length - 1] === card;

            // If the card isn't on top of its tableau pile, return false
            if (!isTopCard) {
                return false;
            }
        }

        
        const pileIndex = this.getFoundationPileIndex(card.suit);
        if (pileIndex === -1 || !this.canPlaceInFoundation(card)) {
            return false;
        }

        // Determine the foundation pile and its coordinates
        const foundationPile = this.foundationPiles[pileIndex];
        const targetX = FOUNDATION_COORDS_INIT.x + pileIndex * FOUNDATION_COORDS_DELTA.x; // Adjust base coordinates
        const targetY = FOUNDATION_COORDS_INIT.y;

        // Call the transition manager to handle the movement
        card.setFaceUp(true)
        this.cardTransitionManager.moveCardToFoundation(
            card,
            targetX,
            targetY,
            foundationPile,
            foundationPile.length,
            this.gameplayContainer,
            () => {
                this.removeCardFromTransition(card)
                this.addCardToFoundation(card, pileIndex)
                
            }
        );

        this.addCardToTransition(card)
        this.addCardToFoundation(card, pileIndex)
        

        return true;
    }


    getTopStockCard(): Card | undefined {
        return this.stockPile[this.stockPile.length - 1];
    }

   // Distribute the deck into piles based on Klondike Solitaire rules
   distributeCardsToPiles(deck: Card[]) {
        // Fill each of the seven tableau piles incrementally
        for (let i = 0; i < 7; i++) {
            for (let j = 0; j <= i; j++) {
                const card = deck.shift(); // Remove the card from the deck
                if (card) {
                    card.setFaceUp(j === i); // Only the top card in each pile is face-up
                    this.addCardToTableau(card, i);
                }
            }
        }

        // The remaining cards go to the stock pile
        this.stockPile = deck; // The rest of the deck becomes the stock
        this.stockPile.forEach(x => this.addCardToStock(x));
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

    // Check if a card can be placed in the target tableau pile according to Klondike rules
    private canMoveToTableauPile(card: Card, targetPile: Array<Card>): boolean {
        // According to Klondike rules, cards should be placed in descending order and alternating colors
        if (targetPile.length === 0) {
            return card.rank === Rank.King; // Empty tableau piles can only accept Kings
        }

        const topCard = targetPile[targetPile.length - 1];
        return (topCard.rank === card.rank + 1) && (this.isOppositeColor(card.suit, topCard.suit));
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

    // Get the foundation pile index based on suit
    private getFoundationPileIndex(suit: Suit): number {
        switch (suit) {
            case Suit.Clubs: return 0;
            case Suit.Diamonds: return 1;
            case Suit.Hearts: return 2;
            case Suit.Spades: return 3;
            default: return -1;
        }
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

    // Add a card to the foundation pile
    addCardToFoundation(card: Card, pileIndex: number) {
        this.addCardToPile(card, PileType.Foundation, pileIndex);
    }

    // Add a card to the tableau pile
    addCardToTableau(card: Card, pileIndex: number) {
     
        this.addCardToPile(card, PileType.Tableau, pileIndex);
    }

    // Add a card to the waste pile
    addCardToWaste(card: Card) {
        this.addCardToPile(card, PileType.Waste, 0); // Only one waste pile
    }

    // Add a card to the stock pile
    addCardToStock(card: Card) {
        this.addCardToPile(card, PileType.Stock, 0); // Only one stock pile
    }    
    
    // Add a card to the stock pile
    addCardToTransition(card: Card) {
        card.inTransition = true;
    }

    removeCardFromTransition(card : Card) {
        card.inTransition = false;
    }

    listTableauCardsWithDepthAndName() {
        console.log("Listing all cards in the tableau with depth and name:");
        this.tableauPiles.forEach((pile, pileIndex) => {
            console.log(`Tableau Pile ${pileIndex}:`);
            pile.forEach((card) => {
                const depth = card.depth; // Assuming `depth` is a property on Card
                const name = card.getName(); // Assuming `getName` is a method on Card
                console.log(`Card: ${name}, Depth: ${depth}`);
            });
        });

    }    
    
    listWasteCardsWithDepthAndName() {



            this.wastePile.forEach((card) => {
                const depth = card.depth; // Assuming `depth` is a property on Card
                const name = card.getName(); // Assuming `getName` is a method on Card
                
                console.log(`Card: ${name}, Depth: ${depth}, isFaceUp: ${card.isFaceUp}`);
            });


    }

    listTransitionCardsWithDepthAndName() {
        this.transitionPile.forEach(card => {
            const depth = card.depth; // Assuming `depth` is a property on Card
            const name = card.getName(); // Assuming `getName` is a method on Card
            console.log(`Card: ${name}, Depth: ${depth}`);

        })
    }

    // Additional utility methods like checking game rules, validating moves, etc.
}

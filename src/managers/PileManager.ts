import { PileType } from "../config/Consts";
import Card from "../elements/Card";
import CardLayoutManager from './CardLayoutManager';


export default class PileManager {
    private tableauPiles: Array<Array<Card>>;
    private foundationPiles: Array<Array<Card>>;
    private stockPile: Array<Card>;
    private wastePile: Array<Card>;
    tableauBasePositions: { x: number; y: number; }[];
    cardLayoutManager: any;

    constructor() {
        // Initialize empty tableau piles (7 in total)
        this.tableauPiles = Array.from({ length: 7 }, () => []);

        // Initialize empty foundation piles (4 in total, one per suit)
        this.foundationPiles = Array.from({ length: 4 }, () => []);

        // Initialize empty stock and waste piles
        this.stockPile = [];
        this.wastePile = [];


        // Example base positions
        this.tableauBasePositions = [
            { x: 100, y: 200 },
            { x: 200, y: 200 },
            { x: 300, y: 200 },
            // Additional base positions for other tableau piles
        ];

        this.cardLayoutManager = new CardLayoutManager();
    }

   // Distribute the deck into piles based on Klondike Solitaire rules
   distributeCardsToPiles(deck: Card[]) {
        // Fill each of the seven tableau piles incrementally
        for (let i = 0; i < 7; i++) {
            for (let j = 0; j <= i; j++) {
                const card = deck.shift(); // Remove the card from the deck
                if (card) {
                    card.setFaceUp(j === i); // Only the top card in each pile is face-up
                    this.tableauPiles[i].push(card);
                }
            }
        }

        // The remaining cards go to the stock pile
        this.stockPile = deck; // The rest of the deck becomes the stock
    }

    // Tableau Management

    addCardToTableau(card: Card, pileIndex: number) {
        card.setPile(PileType.Tableau, pileIndex);
        this.tableauPiles[pileIndex].push(card);
    }

    removeTopCardFromTableau(pileIndex: number): Card | undefined {
        return this.tableauPiles[pileIndex].pop(); // Remove the top card
    }

    getCardFromTableau(pileIndex: number, cardIndex: number): Card | undefined {
        return this.tableauPiles[pileIndex][cardIndex];
    }

    getTopCardFromTableau(pileIndex: number): Card | undefined {
        const pile = this.tableauPiles[pileIndex];
        return pile.length > 0 ? pile[pile.length - 1] : undefined;
    }

    moveCardToTableau(sourcePileIndex: number, destinationPileIndex: number) {
        const card = this.removeTopCardFromTableau(sourcePileIndex);
        if (card) {
            this.addCardToTableau(card, destinationPileIndex);
        }
    }

    layoutTableau() {
        this.tableauPiles.forEach((pile, index) => {
            const basePosition = this.tableauBasePositions[index];
            this.cardLayoutManager.layoutTableauPile(pile, basePosition.x, basePosition.y);
        });
    }

    // Foundation Management

    addCardToFoundation(card: Card, pileIndex: number) {
        card.setPile(PileType.Foundation, pileIndex);
        this.foundationPiles[pileIndex].push(card);
    }

    removeTopCardFromFoundation(pileIndex: number): Card | undefined {
        return this.foundationPiles[pileIndex].pop(); // Remove the top card
    }

    getTopCardFromFoundation(pileIndex: number): Card | undefined {
        const pile = this.foundationPiles[pileIndex];
        return pile.length > 0 ? pile[pile.length - 1] : undefined;
    }

    moveCardToFoundation(sourcePileIndex: number, destinationPileIndex: number) {
        const card = this.removeTopCardFromTableau(sourcePileIndex);
        if (card) {
            this.addCardToFoundation(card, destinationPileIndex);
        }
    }

    // Stock and Waste Management

    addCardToStock(card: Card) {
        card.setPile(PileType.Stock, 0); // Only one stock pile, index 0
        this.stockPile.push(card);
    }

    drawCardFromStock(): Card | undefined {
        return this.stockPile.pop();
    }

    addCardToWaste(card: Card) {
        card.setPile(PileType.Waste, 0); // Only one waste pile, index 0
        this.wastePile.push(card);
    }

    removeTopCardFromWaste(): Card | undefined {
        return this.wastePile.pop();
    }

    getTopCardFromWaste(): Card | undefined {
        return this.wastePile.length > 0 ? this.wastePile[this.wastePile.length - 1] : undefined;
    }

    // Shuffling Stock

    shuffleStock() {
        for (let i = this.stockPile.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.stockPile[i], this.stockPile[j]] = [this.stockPile[j], this.stockPile[i]];
        }
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

    // Additional utility methods like checking game rules, validating moves, etc.
}

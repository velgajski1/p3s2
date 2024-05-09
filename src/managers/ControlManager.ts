// ControlManager.ts
import { PileType } from '../config/Consts';
import Card from '../elements/Card';
import PileManager from './PileManager';

class ControlManager {

    private pileManager: PileManager;

    constructor(pileManager: PileManager) {
        this.pileManager = pileManager;
    }

    // Set up click controls for a specific card
    setupCardClickControl(card: Card) {
        card.setInteractive();
        card.on('pointerdown', () => this.handleCardClick(card));
    }

    setupControls() {
        // Set up tableau cards
        this.pileManager.getTableauPiles().forEach((pile) => {
            pile.forEach((card) => this.setupCardClickControl(card));
        });

        // Set up foundation cards
        this.pileManager.getFoundationPiles().forEach((pile) => {
            pile.forEach((card) => this.setupCardClickControl(card));
        });

        // Set up stock cards
        this.pileManager.getStockPile().forEach((card) => this.setupCardClickControl(card));

        // Set up waste cards
        this.pileManager.getWastePile().forEach((card) => this.setupCardClickControl(card));
    }
    // Handler for card click events
    // Handle the click event based on card's pile type
    private handleCardClick(card: Card) {
        switch (card.pileType) {
            case PileType.Tableau:
                if (card.isFaceUp)  this.pileManager.handleTableauClicked(card);
                break;

            case PileType.Foundation:
                // Example: Show an error or display a message
                console.log('Foundation cards are not interactive in this game.');
                break;

            case PileType.Stock:
                // Example: Move to the waste pile or flip if applicable
                this.pileManager.moveTopCardStockToWaste();
                break;

            case PileType.Waste:
                // Example: Attempt to move the card to another pile if possible
                console.log('Clicked on waste card ', card.getName());
                break;

            default:
                console.warn('Unknown pile type.');
                break;
        }
    }

}

export default ControlManager;

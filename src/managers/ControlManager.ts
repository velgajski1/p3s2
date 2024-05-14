// ControlManager.ts
import { PileType } from '../config/Consts';
import Card from '../elements/Card';
import { GameManager } from './GameManager';
import PileManager from './PileManager';

class ControlManager {

    private pileManager: PileManager;
    private isClickEnabled: boolean = true;

    constructor(pileManager: PileManager) {
        this.pileManager = pileManager;
    }

    // Set up click controls for a specific card
    setupCardClickControl(card: Card) {
     
        card.removeAllListeners('pointerdown');
        card.setInteractive();
        card.on('pointerdown', () => this.handleCardClick(card));
        card.controlManager = this;
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
        // Prevent additional clicks if a card click was already processed
        if (!this.isClickEnabled) {
          
            return;
        }

        // Disable clicks for the cooldown period
        this.disableCardClicksTemporarily();

        switch (card.pileType) {
            case PileType.Tableau:
                if (card.isFaceUp)  this.pileManager.handleTableauClicked(card);
                break;

            case PileType.Foundation:
                // Example: Show an error or display a message
               
                break;

            case PileType.Stock:
                // Example: Move to the waste pile or flip if applicable
               
                
                this.pileManager.moveTopCardStockToWaste();
                break;

            case PileType.Waste:
               
                // Example: Attempt to move the card to another pile if possible
                this.pileManager.handleWasteClicked(card);
                // this.pileManager.listTableauCardsWithDepthAndName();
                this.pileManager.gameplayContainer.sort("depth");
                break;

            default:
                console.warn('Unknown pile type.');
                break;
        }
    }

        // Disable card clicks and re-enable after 100 ms
        private disableCardClicksTemporarily() {
            this.isClickEnabled = false;
    
            // Re-enable clicks after 100 milliseconds
            setTimeout(() => {
                this.isClickEnabled = true;
            }, 120);
        }

}

export default ControlManager;

import PileManager from './PileManager';
import Card from '../elements/Card';
import { PileType } from '../config/Consts';
import { Rank, Suit } from './CardNameManager';

export default class HintManager {
    pileManager: PileManager;
    hints: string[];
    lastHintIndex: number;

    constructor(pileManager: PileManager) {
        this.pileManager = pileManager;
        this.hints = [];
        this.lastHintIndex = -1;
    }

    // Generate all possible hints
    generateHints() {
        this.hints = [];

        // Priority 1: Move from Waste to Foundation
        const wasteTopCard = this.pileManager.getTopCardFromWaste();
        if (wasteTopCard && this.pileManager.canMoveCardToFoundation(wasteTopCard, -1)) {
            let pileIdx = this.pileManager.getFoundationPileIndex(wasteTopCard.suit);
            this.hints.push(`Move ${wasteTopCard.getName()} from Waste to Foundation`);
        }

        // Priority 1: Move from Tableau to Foundation
        for (let i = 0; i < 7; i++) {
            const tableauTopCard = this.pileManager.getTopCardFromTableau(i);
            if (tableauTopCard && this.pileManager.canMoveCardToFoundation(tableauTopCard, -1)) {
                this.hints.push(`Move ${tableauTopCard.getName()} from Tableau ${i + 1} to Foundation`);
            }
        }

        // Priority 2: Move within Tableau piles
        for (let i = 0; i < 7; i++) {
            const tableauPile = this.pileManager.getTableauPiles()[i];
            for (let j = 0; j < tableauPile.length; j++) {
                const card = tableauPile[j];
                if (card.isFaceUp) {
                    for (let k = 0; k < 7; k++) {
                        if (i !== k && this.pileManager.canMoveToTableauPile(card, this.pileManager.getTableauPiles()[k])) {
                            this.hints.push(`Move ${card.getName()} from Tableau ${i + 1} to Tableau ${k + 1}`);
                        }
                    }
                }
            }
        }

        // Priority 3: Move from Waste to Tableau
        if (wasteTopCard) {
            for (let i = 0; i < 7; i++) {
                if (this.pileManager.canMoveToTableauPile(wasteTopCard, this.pileManager.getTableauPiles()[i])) {
                    this.hints.push(`Move ${wasteTopCard.getName()} from Waste to Tableau ${i + 1}`);
                }
            }
        }

        // Priority 4: Move from Stock to Waste
        const stockTopCard = this.pileManager.getTopStockCard();
        if (stockTopCard) {
            this.hints.push(`Move ${stockTopCard.getName()} from Stock to Waste`);
        }

        // If no hints available, add a default message
        if (this.hints.length === 0) {
            this.hints.push('No hints available');
        }
    }

    // Provide hints to the player
    getHint(): string {
        // Generate hints if none exist
        if (this.hints.length === 0) {
            this.generateHints();
        }

        // Cycle through hints
        this.lastHintIndex = (this.lastHintIndex + 1) % this.hints.length;
        return this.hints[this.lastHintIndex];
    }
}

import PileManager from './PileManager';
import Card from '../elements/Card';
import { HINT_NEXT_OVERLAY_DELTA, PileType } from '../config/Consts';
import { Rank, Suit } from './CardNameManager';
import CardLayoutManager from './CardLayoutManager';

type Hint = {
    first: () => void;
    second: () => void;
}

export default class HintManager {
    private static instance: HintManager;
    pileManager: PileManager;
    hints: Hint[];
    lastHintIndex: number;
    layoutManager: CardLayoutManager;


    private constructor() {
        this.hints = [];
        this.lastHintIndex = -1;
        // this.layoutManager = this.pileManager.cardLayoutManager;
    }

    // Static method to control the access to the singleton instance
    public static getInstance(): HintManager {
        if (!HintManager.instance) {
            HintManager.instance = new HintManager();
        }
        return HintManager.instance;
    }

    // Generate all possible hints
    generateHints(pileManager: PileManager) {
        this.pileManager = pileManager;
        this.hints = [];

        // Priority 1: Move from Waste to Foundation
        const wasteTopCard = this.pileManager.getTopCardFromWaste();
        if (wasteTopCard && this.pileManager.canMoveCardToFoundation(wasteTopCard, -1)) {
            let pileIdx = this.pileManager.getFoundationPileIndex(wasteTopCard.suit);
            this.hints.push({
                first: () => { this.pileManager.cardLayoutManager.hintWaste() },
                second: () => { 
                    this.pileManager.cardLayoutManager.hintFoundIdx(pileIdx)
                 }
            });
        }

        // Priority 1: Move from Tableau to Foundation
        for (let i = 0; i < 7; i++) {
            const tableauTopCard = this.pileManager.getTopCardFromTableau(i);
            if (tableauTopCard && this.pileManager.canMoveCardToFoundation(tableauTopCard, -1)) {
                // this.hints.push(`Move ${tableauTopCard.getName()} from Tableau ${i + 1} to Foundation`);
                this.hints.push({
                    first: () => { tableauTopCard.startHintAnim() },
                    second: () => { 
                        this.pileManager.cardLayoutManager.hintFoundIdx(this.pileManager.getFoundationPileIndex(tableauTopCard.suit))
                     }
                });
            }
        }

        // Priority 2: Move within Tableau piles
        for (let i = 0; i < 7; i++) {
            const tableauPile = this.pileManager.getTableauPiles()[i];
            for (let j = 0; j < tableauPile.length; j++) {
                const card = tableauPile[j];
                if (card.isFaceUp) {
                    for (let k = 0; k < 7; k++) {
                        if (i != k && this.pileManager.canMoveToTableauPile(card, this.pileManager.getTableauPiles()[k])) {
                            // this.hints.push(`Move ${card.getName()} from Tableau ${i + 1} to Tableau ${k + 1}`);
                            this.hints.push({
                                first: () => { card.startHintAnim() },
                                second: () => { 
                                    this.hintTableu(k);
                                 }
                            });
                        }
                    }
                }
            }
        }

        // Priority 3: Move from Waste to Tableau
        if (wasteTopCard) {
            for (let i = 0; i < 7; i++) {
                if (this.pileManager.canMoveToTableauPile(wasteTopCard, this.pileManager.getTableauPiles()[i])) {
                    // this.hints.push(`Move ${wasteTopCard.getName()} from Waste to Tableau ${i + 1}`);
                }
            }
        }

        // Priority 4: Move from Stock to Waste
        const stockTopCard = this.pileManager.getTopStockCard();
        if (stockTopCard) {
            // this.hints.push(`Move ${stockTopCard.getName()} from Stock to Waste`);
        }

        // If no hints available, add a default message
        if (this.hints.length === 0) {
            // this.hints.push('No hints available');
        }

        // Log generated hints to console
        console.log('Generated Hints:', this.hints);
    }
    hintTableu(k: number)
    {
        let tabPile = this.pileManager.getTableauPiles()[k];
        if (tabPile.length <= 0)
        {
            this.pileManager.cardLayoutManager.hintTabIdx(k)
        } 
        else 
        {
            this.pileManager.getTopCardFromTableau(k)?.startHintAnim()
        }
    }

    // Provide hints to the player
    getHint(pileManager: PileManager): void {
        // Generate hints if none exist
        if (this.hints.length === 0) {
            this.generateHints(pileManager);
        }

        // Cycle through hints
        this.lastHintIndex = (this.lastHintIndex + 1) % this.hints.length;
        const hint = this.hints[this.lastHintIndex];
        hint.first()

        const blinkInterval = HINT_NEXT_OVERLAY_DELTA // Total duration divided by double the number of blinks
        
        setTimeout(() => {
            hint.second()
        }, blinkInterval);

        // this.pileManager.scene.time.addEvent({
        //     delay: blinkInterval,
        //     callback: () => {
        //         hint.second()
                
        //     }
        // });
    
    }
}

import PileManager from './PileManager';
import Card from '../elements/Card';
import { HINT_NEXT_OVERLAY_DELTA, PileType } from '../config/Consts';
import { Rank, Suit } from './CardNameManager';
import CardLayoutManager from './CardLayoutManager';
import { SoundManager } from './SoundManager';
import { SOUND_ACTIVE } from '../config/Config';

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
    secondTimer: NodeJS.Timeout;


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

    isUsefulMove (card : Card, sourceIndex: number, targetIndex: number): boolean  {
        const sourcePile = this.pileManager.getTableauPiles()[sourceIndex];
        const targetPile = this.pileManager.getTableauPiles()[targetIndex];
        const targetCard : Card = targetPile[targetPile.length-1];
        const belowCard = sourcePile[sourcePile.indexOf(card)-1];
        if (sourcePile.length < 2 || belowCard == null) {
            if (targetPile.length == 0) return false;
            return true;
        } 
        
        
        

        // Condition a: Card below is turned/uncovered
        if (!belowCard.isFaceUp) {
            
            return true;
        } 

        if (this.pileManager.canMoveCardToFoundation(belowCard, -1)) {
            return true;
        }

        // Condition b: Card below can be moved to another tableau pile or to the foundation
        // for (let i = 0; i < 7; i++) {
        //     if (i !== sourceIndex && this.pileManager.canMoveToTableauPile(belowCard, this.pileManager.getTableauPiles()[i])) {
        //         if (targetCard) 
        //         {
        //             if (card.rank==targetCard.rank) return false;
        //         } 
        //         return true;
        //     }
        // }


        return false;
    };

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
                    first: () => { this.hintTableuCard(tableauTopCard) },
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
                        if (i != k && this.pileManager.canMoveToTableauPile(card, this.pileManager.getTableauPiles()[k]) && this.isUsefulMove(card, i, k)) {
                            // this.hints.push(`Move ${card.getName()} from Tableau ${i + 1} to Tableau ${k + 1}`);
                            this.hints.push({
                                first: () => { this.hintTableuCard(card) },
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
                    this.hints.push({
                        first: () => {this.pileManager.cardLayoutManager.hintWaste()  },
                        second: () => { 
                            this.hintTableu(i);
                         }
                    });
                }
            }
        }

        // Priority 4: Move from Stock to Waste
        const stockTopCard = this.pileManager.getTopStockCard();
        if (stockTopCard) {
            this.hints.push({
                first: () => {this.pileManager.cardLayoutManager.hintStock()  },
                second: () => { 
                    this.pileManager.cardLayoutManager.hintWaste()  
                 }
            });
        }
    
        if (!stockTopCard && this.pileManager.getWastePile().length > 0) {
            this.hints.push({
                first: () => {this.pileManager.cardLayoutManager.hintStock()  },
                second: () => { 
                    // this.pileManager.cardLayoutManager.hintWaste()  
                 }
            });
        }

        // If no hints available, add a default message
        if (this.hints.length == 0) {
            // this.hints.push('No hints available');
        }
        this.hints= this.hints.reverse()

        // Log generated hints to console
        // 
    }
    hintTableuCard(tableauTopCard: Card)
    {
        let substack : Card[] = this.pileManager.getSubstack(tableauTopCard);
        substack.forEach((c,i) => {
            c.startHintAnim(0)

            if (i < substack.length - 1) {
                let cNextY : number = substack[i+1].y;
                let yDelta = cNextY-c.y
       
                c.startHintAnim(yDelta)
            }
        })
        
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
            this.pileManager.getTopCardFromTableau(k)?.startHintAnim(0)
        }
    }

    clearHints() {

        this.hints = [];
        this.lastHintIndex = 0;
        if (this.pileManager){
            this.pileManager.getAllCards().forEach(c => c.cancelHintAnim())
            this.layoutManager = this.pileManager.cardLayoutManager
        }  
        if (this.layoutManager) {
            this.layoutManager.removeHintTimer()
            this.layoutManager.removeHintOutline()
            
        }
        if (this.secondTimer) {
            clearTimeout(this.secondTimer)
        }

    }

    // Provide hints to the player
    getHint(pileManager: PileManager): void {
        // Generate hints if none exist
        if (this.hints.length === 0) {
            this.generateHints(pileManager);
        }

        // Cycle through hints
        if (this.hints.length == 0){
            SoundManager.instance.noHint.play();
            return;

        } 
        this.lastHintIndex = (this.lastHintIndex + 1) % this.hints.length;
        const hint = this.hints[this.lastHintIndex];
        hint.first()

        SOUND_ACTIVE && SoundManager.instance.hint.play();

        const blinkInterval = HINT_NEXT_OVERLAY_DELTA // Total duration divided by double the number of blinks
        
        this.secondTimer=  setTimeout(() => {
            hint.second()
        }, blinkInterval);


    
    }
}



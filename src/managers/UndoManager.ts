import Card from "../elements/Card";
import { GameState } from "../utils/types";

export default class UndoManager {
    private static instance: UndoManager;
    private states: GameState[] = [];

    private constructor() {}

    public static getInstance(): UndoManager {
        if (!UndoManager.instance) {
            UndoManager.instance = new UndoManager();
        }
        return UndoManager.instance;
    }

    public saveState(state: GameState) {
        const copiedState = this.deepCopyState(state);
        const lastState = this.states[this.states.length - 1];
        const totalCards = this.countTotalCards(copiedState);

        if (totalCards == 52 && (!lastState || !this.areStatesEqual(lastState, copiedState))) {
            this.states.push(copiedState);
            
        }
    }

    private deepCopyState(state: GameState): GameState {
        const tableauPiles = state.tableauPiles.map(pile => [...pile]);
        const foundationPiles = state.foundationPiles.map(pile => [...pile]);
        const stockPile = [...state.stockPile];
        const wastePile = [...state.wastePile];
    
        // Calculate flippedCounts based on the number of face-up cards in each tableau pile
        const flippedCounts = tableauPiles.map(pile => 
            pile.reduce((count, card) => count + (card.isFaceUp ? 1 : 0), 0)
        );
    
        return {
            tableauPiles,
            foundationPiles,
            stockPile,
            wastePile,
            flippedCounts  // Calculated flipped counts for tableau piles
        };
    }
    
    

    private countTotalCards(state: GameState): number {
        return state.tableauPiles.flat().length +
               state.foundationPiles.flat().length +
               state.stockPile.length +
               state.wastePile.length;
    }

    private areStatesEqual(state1: GameState, state2: GameState): boolean {
        // Check if the counts of cards in each pile type match
        if (state1.tableauPiles.length !== state2.tableauPiles.length ||
            state1.foundationPiles.length !== state2.foundationPiles.length ||
            state1.stockPile.length !== state2.stockPile.length ||
            state1.wastePile.length !== state2.wastePile.length) {
            return false;
        }
    
        // Function to compare two card piles
        const comparePiles = (pile1: Card[], pile2: Card[]) => {
            return pile1.length === pile2.length && pile1.every((card, index) => 
                card.suit === pile2[index].suit && 
                card.rank === pile2[index].rank && 
                card.isFaceUp === pile2[index].isFaceUp);
        };
    
        // Compare each tableau pile
        for (let i = 0; i < state1.tableauPiles.length; i++) {
            if (!comparePiles(state1.tableauPiles[i], state2.tableauPiles[i])) {
                return false;
            }
        }
    
        // Compare each foundation pile
        for (let i = 0; i < state1.foundationPiles.length; i++) {
            if (!comparePiles(state1.foundationPiles[i], state2.foundationPiles[i])) {
                return false;
            }
        }
    
        // Compare stock and waste piles
        if (!comparePiles(state1.stockPile, state2.stockPile) || !comparePiles(state1.wastePile, state2.wastePile)) {
            return false;
        }
    
        return true;
    }
    
    public undo(): GameState | null {
        
        if (this.states.length > 1) {
            this.states.pop();
            const prevState = this.states[this.states.length - 1];
            this.applyState(prevState);
            return prevState;
        }
        return null;
    }

    private applyState(state: GameState) {
        // Implement logic to apply the saved state, including flipping cards back
        // This function would typically involve iterating over the game elements and setting them to match the state
        
    }
}

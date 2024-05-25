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
        return JSON.stringify(state1) === JSON.stringify(state2);
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

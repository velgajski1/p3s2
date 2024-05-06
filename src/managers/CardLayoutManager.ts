// CardLayoutManager.ts
import { CARD_SCALE, FOUNDATION_COORDS_DELTA, FOUNDATION_COORDS_INIT, STOCK_COORDS, TABLEU_COORDS_DELTA, TABLEU_COORDS_INIT, WASTE_DELTA_FROM_STOCK, WASTE_OVERLAP } from "../config/Consts";
import Card from "../elements/Card";
import { Rank, Suit } from "./CardNameManager";
class CardLayoutManager {
    // Layout method for stock pile, usually a single stack
    layoutStockPile(cards: Card[]) {
        cards.forEach((card, index) => {
            card.x = STOCK_COORDS.x;
            card.y = STOCK_COORDS.y;
            card.scale = CARD_SCALE
            card.setDepth(index); // Ensure stacking order for the stock
            card.setFaceUp(false);
        });
    }

    // Layout method for waste pile, which might have slight overlap
    layoutWastePile(cards: Card[]) {
        cards.forEach((card, index) => {
            card.x = STOCK_COORDS.x + WASTE_DELTA_FROM_STOCK + index * WASTE_OVERLAP; // Overlapping horizontally for each card
            card.y = STOCK_COORDS.y;
            card.setDepth(index); // Correct stacking order for waste pile
        });
    }

    // Add more layout methods for additional pile types or special layouts...
    // Layout method for the tableau piles
    layoutTableauPiles(tableauPiles: Array<Array<Card>>) {
        tableauPiles.forEach((pile, pileIndex) => {
            const x = TABLEU_COORDS_INIT.x + pileIndex * TABLEU_COORDS_DELTA.x; // Adjust horizontal spacing
            pile.forEach((card, cardIndex) => {
                card.x = x;
                card.y = TABLEU_COORDS_INIT.y + cardIndex * TABLEU_COORDS_DELTA.y; // Vertical overlapping offset
                card.setDepth(pileIndex*100 + cardIndex); // Ensure correct stacking order
                card.scale = CARD_SCALE;
                console.log(card.depth, Suit[card.suit], Rank[card.rank])

            });
            
        });
        
    }

    // Layout method for the foundation piles
    layoutFoundationPiles(foundationPiles: Array<Array<Card>>, baseX: number = 700, baseY: number = 100, horizontalOffset: number = 150) {
        foundationPiles.forEach((pile, pileIndex) => {
            const x = baseX + pileIndex * horizontalOffset; // Adjust horizontal spacing
            pile.forEach((card, cardIndex) => {
                card.x = x;
                card.y = baseY;
                card.setDepth(1000 + pileIndex * 10 + cardIndex); // Ensure correct stacking order
            });
        });
    }


        // Add visual indicators for the foundation piles
        addFoundationIndicators(scene: Phaser.Scene, cont : Phaser.GameObjects.Container) {
            for (let i = 0; i < 4; i++) {
                const x = FOUNDATION_COORDS_INIT.x + i * FOUNDATION_COORDS_DELTA.x;
                const y = FOUNDATION_COORDS_INIT.y;
    
                // Create a sprite for the foundation indicator
                const foundationIndicator = scene.add.sprite(x, y, 'cards', 'cards/holder_foundation_cards.png');
                foundationIndicator.setDepth(9000); // Ensure the indicator is below cards
                cont.add(foundationIndicator);
                // Optionally, customize the indicator with scale or tint
                foundationIndicator.setScale(CARD_SCALE);
                // foundationIndicator.setTint(0xaaaaaa); // Example: Slight gray tint
            }
        }

    
}

export default CardLayoutManager;

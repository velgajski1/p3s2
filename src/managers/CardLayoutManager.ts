// CardLayoutManager.ts
import { CARD_SCALE, FOUNDATION_COORDS_DELTA, FOUNDATION_COORDS_INIT, STOCK_COORDS, TABLEU_COORDS_DELTA, TABLEU_COORDS_INIT, WASTE_DELTA_FROM_STOCK, WASTE_OVERLAP } from "../config/Consts";
import Card from "../elements/Card";
import { Rank, Suit } from "./CardNameManager";
import PileManager from "./PileManager";
class CardLayoutManager {
    layoutAll(stockpile:Card[], wastepile :Card[], tableauPiles: Array<Array<Card>>,foundationPiles: Array<Array<Card>>) 
    {
        this.layoutStockPile(stockpile)
        this.layoutWastePile(wastepile)
        this.layoutTableauPiles(tableauPiles)
        this.layoutFoundationPiles(foundationPiles)
    }
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


    // Add a visual indicator for the waste pile
    addWasteIndicator(scene: Phaser.Scene, cont: Phaser.GameObjects.Container) {
        // Create a sprite for the waste pile indicator
        const wasteIndicator = scene.add.sprite(STOCK_COORDS.x+WASTE_DELTA_FROM_STOCK, STOCK_COORDS.y, 'cards', 'cards/holder_foundation_cards.png');
        wasteIndicator.setDepth(-9000); // Ensure the indicator is below cards
        wasteIndicator.setScale(CARD_SCALE);
        cont.add(wasteIndicator);
    }    
    // Add a visual indicator for the stock pile
    addStockIndicator(pileManager: PileManager, scene: Phaser.Scene, cont: Phaser.GameObjects.Container) {
        // Create a sprite for the waste pile indicator
        const stockIndicator = scene.add.sprite(STOCK_COORDS.x, STOCK_COORDS.y, 'cards', 'cards/holder_stock_cards.png');
        stockIndicator.setDepth(-9000); // Ensure the indicator is below cards
        stockIndicator.setScale(CARD_SCALE);
        cont.add(stockIndicator);

        // Make the indicator interactive and listen for clicks
        stockIndicator.setInteractive();
        stockIndicator.on('pointerdown', () => {
            pileManager.moveAllCardsFromWasteToStock(); // Move all cards from waste back to stock
        });
    }

        

    
}

export default CardLayoutManager;

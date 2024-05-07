import { PileType, STOCK_COORDS, WASTE_DELTA_FROM_STOCK } from '../config/Consts';
import Card from '../elements/Card'; // Adjust import path as needed

class CardTransitionManager {

    private scene: Phaser.Scene;

    constructor( ) { }

    moveAllCardsFromWasteToStock(stockPile: Card[], wastePile: Card[], gameplayContainer: Phaser.GameObjects.Container)
    {
        // Reverse the waste pile and add to the stock
        while (wastePile.length > 0) {
            const card = wastePile.pop();
            if (card) {
                card.setFaceUp(false); // Ensure the card is face-down
                card.setPileType(PileType.Stock);
                stockPile.push(card); // Add back to the stock pile
                card.pileIndex = stockPile.length-1;
                card.setDepth (card.pileIndex);
                gameplayContainer.sort("depth");
                card.setX(STOCK_COORDS.x)
                card.setY(STOCK_COORDS.y)
            }
        }
    }
  

    moveTopCardStockToWaste(stockPile: any[], wastePile: any[], gameplayContainer: Phaser.GameObjects.Container) 
    {
        
        const card = stockPile.pop(); // Take the top card from the stock pile
        console.log(card?.depth, card?.getName())
        if (card) {
            card.setInteractive(false); // Temporarily disable interaction
            // Create a tween to move the card visually to the waste pile

            card.scene.tweens.add({
                targets: card,
                x: STOCK_COORDS.x+WASTE_DELTA_FROM_STOCK,
                y: STOCK_COORDS.y,
                duration: 500, // Adjust the duration as needed
                ease: 'Cubic.easeInOut',
                onComplete: () => {
                    card.setFaceUp(true); // Flip the card to show its face
                    card.setInteractive(true); // Re-enable interaction if needed
                    wastePile.push(card); // Add the card to the waste pile
                    card.setPileType(PileType.Waste);
                    card.pileIndex = wastePile.length - 1;
                    card.setDepth (card.pileIndex);
                    gameplayContainer.sort("depth");
                }
            });

            card.setDepth (100000);
            gameplayContainer.sort("depth");
        }
    }

    // Flip the card with animation (from back to front or vice versa)
    flipCard(card: Card, duration: number = 300, onComplete?: () => void) {
        this.scene.tweens.add({
            targets: card,
            scaleX: 0, // Shrink to zero width to simulate a flip
            duration: duration / 2,
            onComplete: () => {
                // Swap textures and then expand back to normal size
                card.flip();
                this.scene.tweens.add({
                    targets: card,
                    scaleX: 1,
                    duration: duration / 2,
                    onComplete: () => {
                        if (onComplete) onComplete();
                    }
                });
            }
        });
    }


}

export default CardTransitionManager;

import { CARD_SCALE, PileType, STOCK_COORDS, TABLEU_COORDS_DELTA, TABLEU_COORDS_INIT, WASTE_DELTA_FROM_STOCK } from '../config/Consts';
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
                card.setDepth (stockPile.length-1);
                gameplayContainer.sort("depth");
                card.setX(STOCK_COORDS.x)
                card.setY(STOCK_COORDS.y)
            }
        }
    }

    moveCardToTableau(card: Card, targetPileIndex : number, indexWithinTargetPile:number, container: Phaser.GameObjects.Container, onComplete: () => void) {
        card.setInteractive(false); // Temporarily disable interaction during the movement

        // Tween to move the card to the new pile visually
        card.scene.tweens.add({
            targets: card,
            x: TABLEU_COORDS_INIT.x + TABLEU_COORDS_DELTA.x*targetPileIndex,
            y: TABLEU_COORDS_INIT.y + TABLEU_COORDS_DELTA.y*(indexWithinTargetPile),
            duration: 500, // Adjust as necessary
            ease: 'Cubic.easeInOut',
            onComplete: () => {
                // Enable interaction and call the completion callback
                card.setInteractive(true);
                onComplete();
            }
        });

        card.setDepth (100000+indexWithinTargetPile);
        container.sort("depth");
    }

    // Move a card to the foundation with a visual transition
    moveCardToFoundation(card: Card, targetX: number, targetY: number, foundationPile: Card[], pileIndex: number, gameplayContainer : Phaser.GameObjects.Container, onComplete?: () => void) {
        // Temporarily disable interaction during the transition
        card.setInteractive(false);

        // Create a tween to move the card visually to the foundation pile
        card.scene.tweens.add({
            targets: card,
            x: targetX,
            y: targetY,
            duration: 500, // Adjust as needed
            ease: 'Cubic.easeInOut',
            onComplete: () => {



                // Optionally, call additional completion logic
                if (onComplete) onComplete();

                // Re-enable interaction
                card.setInteractive(true);
            }
        });
        card.setDepth (100000);
        gameplayContainer.sort("depth");
    }
  

    moveTopCardStockToWaste(stockPile: any[], wastePile: any[], gameplayContainer: Phaser.GameObjects.Container) 
    {
        
        const card = stockPile.pop(); // Take the top card from the stock pile
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
                    card.setDepth (wastePile.length - 1);
                    gameplayContainer.sort("depth");
                }
            });

            card.setDepth (100000);
            gameplayContainer.sort("depth");
        }
    }

    // Flip the card with animation (from back to front or vice versa)
    flipCard(card: Card, duration: number = 300, onComplete?: () => void) {
        card.scene.tweens.add({
            targets: card,
            scaleX: 0, // Shrink to zero width to simulate a flip
            duration: duration / 2,
            onComplete: () => {
                // Swap textures and then expand back to normal size
                card.flip();
                card.scene.tweens.add({
                    targets: card,
                    scaleX: CARD_SCALE,
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

import { CARD_SCALE, PileType, STOCK_COORDS, TABLEU_COORDS_DELTA, TABLEU_COORDS_INIT, WASTE_DELTA_FROM_STOCK } from '../config/Consts';
import Card from '../elements/Card'; // Adjust import path as needed
import { getTweensForObject } from '../utils/Utils';

class CardTransitionManager {

    private scene: Phaser.Scene;

    constructor( ) { }

    moveAllCardsFromWasteToStock(stockPile: Card[], wastePile: Card[], gameplayContainer: Phaser.GameObjects.Container)
    {
       
        while(stockPile.length > 0) {
            const card = stockPile.pop()
            if (card) {
                getTweensForObject(card.scene, card).forEach(x => x.remove());
                wastePile.push(card);
                
            }
                
        }
        
      
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
                getTweensForObject(card.scene, card).forEach(x => x.remove());
                
            }
        }
    }

    moveCardToTableau(card: Card, targetPileIndex : number, indexWithinTargetPile:number, container: Phaser.GameObjects.Container, onComplete: () => void) {
        card.setInteractive(false); // Temporarily disable interaction during the movement
        getTweensForObject(card.scene, card).forEach(x => x.remove());

        // Tween to move the card to the new pile visually
        card.scene.tweens.add({
            targets: card,
            x: TABLEU_COORDS_INIT.x + TABLEU_COORDS_DELTA.x*targetPileIndex,
            y: TABLEU_COORDS_INIT.y + TABLEU_COORDS_DELTA.y*(indexWithinTargetPile),
            duration: 400, // Adjust as necessary
            ease: 'Cubic.easeOut',
            onComplete: () => {
                // Enable interaction and call the completion callback
                card.setInteractive(true);
                onComplete();
            }
        });

        card.setDepth (10000+indexWithinTargetPile);
        container.sort("depth");
  
    }

    // Move a card to the foundation with a visual transition
    moveCardToFoundation(card: Card, targetX: number, targetY: number, foundationPile: Card[], pileIndex: number, gameplayContainer : Phaser.GameObjects.Container, onComplete?: () => void) {
        // Temporarily disable interaction during the transition
        card.setInteractive(false);
        // getTweensForObject(card.scene, card).forEach(x => x.complete());

        // Create a tween to move the card visually to the foundation pile
        card.scene.tweens.add({
            targets: card,
            x: targetX,
            y: targetY,
            duration: 600, // Adjust as needed
            ease: 'Cubic.easeInOut',
            onComplete: () => {



                // Optionally, call additional completion logic
                if (onComplete) onComplete();

                // Re-enable interaction
                card.setInteractive(true);
            }
        });
        card.setDepth (12000);
        gameplayContainer.sort("depth");
    }
  

    moveTopCardStockToWaste(card: Card, stockPile: any[], wastePile: any[], gameplayContainer: Phaser.GameObjects.Container, onComplete?: () => void) 
    {
        getTweensForObject(card.scene, card).forEach(x => x.remove());
        
        if (card) {
            // Temporarily disable interaction
            // card.removeInteractive()

            card.scene.tweens.add({
                targets: card,
                x: STOCK_COORDS.x+WASTE_DELTA_FROM_STOCK,
                y: STOCK_COORDS.y,
                duration: 300, // Adjust the duration as needed
                ease: 'Cubic.easeOut',
                onComplete: () => {
                    if (onComplete) onComplete();
                    // card.addInteractive()
                }
            });

            card.setDepth (11000);
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

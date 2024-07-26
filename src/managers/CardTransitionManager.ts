import { RIGHT_HANDED_MODE_IDX, SOUND_ACTIVE, STOCK_THREE_MODE_ACTIVE } from '../config/Config';
import { CARD_SCALE, PileType, STOCK_COORDS, TABLEU_COORDS_DELTA, TABLEU_COORDS_INIT, TABLEU_STACK_TWEEN_DURATION, WASTE_DELTA_FROM_STOCK, WASTE_DELTA_X } from '../config/Consts';
import Card from '../elements/Card'; // Adjust import path as needed
import { getTweensForObject } from '../utils/Utils';
import { SoundManager } from './SoundManager';

class CardTransitionManager {


    private scene: Phaser.Scene;

    constructor( ) { }

    moveAllCardsFromWasteToStock(stockPile: Card[], wastePile: Card[], gameplayContainer: Phaser.GameObjects.Container)
    {
        
       SOUND_ACTIVE && SoundManager.instance.flipBackToStock.play()
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
                card.setX(STOCK_COORDS.x[RIGHT_HANDED_MODE_IDX])
                card.setY(STOCK_COORDS.y)
                getTweensForObject(card.scene, card).forEach(x => x.remove());
                
            }
        }
    }

    moveCardToTableau( tab_deltaY : number, tableuPiles : Card[][], card: Card, targetPileIndex: number, indexWithinTargetPile: number, container: Phaser.GameObjects.Container, onComplete: () => void) {
        card.setInteractive(false); // Temporarily disable interaction during the movement
        getTweensForObject(card.scene, card).forEach(x => x.complete());
        SOUND_ACTIVE && SoundManager.instance.valid.play() 
    
        // Calculate the correct y position for the card based on the pile state
        let yPosition = TABLEU_COORDS_INIT.y;
        const targetPile = tableuPiles[targetPileIndex]; // Assuming tableauPiles is available from pileManager

    
        targetPile.filter(card => card.inTransition).forEach(c => {
            if (card.substackid != c.substackid) {
                getTweensForObject(c.scene, c).forEach(x => x.complete());
            }
        });   
        
        for (let i = 0; i < indexWithinTargetPile; i++) {
            if (targetPile[i].isFaceUp) {
                yPosition += tab_deltaY;
            } else {
                yPosition += TABLEU_COORDS_DELTA.y_covered;
            }
        }
    
        // Tween to move the card to the new pile visually
        card.scene.tweens.add({
            targets: card,
            x: TABLEU_COORDS_INIT.x + TABLEU_COORDS_DELTA.x * targetPileIndex,
            y: yPosition,
            duration: TABLEU_STACK_TWEEN_DURATION, // Adjust as necessary
            ease: 'Cubic.easeOut',
            onComplete: () => {
                // Enable interaction and call the completion callback
                card.setInteractive(true);
                card.x = TABLEU_COORDS_INIT.x + TABLEU_COORDS_DELTA.x * targetPileIndex;
                card.y = yPosition;
                onComplete();
                // 
            }
        });
    
        card.setDepth(10000 + indexWithinTargetPile);
        container.sort("depth");
    }
    
    moveWithTween(card : Card, x : number, y : number)
    {
        if (card.x == x && card.y == y) return;
        if (card.hasTweens()) card.finishTweens()
        card.scene.tweens.add({
            targets: card,
            x: x,
            y: y,
            duration: TABLEU_STACK_TWEEN_DURATION/4, // Adjust as necessary
            ease: 'Cubic.easeOut',
        });
    }

    moveWithoutTween(card: Card, x: number, y: number)
    {
        card.finishTweens();
        card.x = x;
        card.y = y;
    }

    // Move a card to the foundation with a visual transition
    moveCardToFoundation(card: Card, targetX: number, targetY: number, foundationPile: Card[], pileIndex: number, gameplayContainer : Phaser.GameObjects.Container, onComplete?: () => void) {
        // Temporarily disable interaction during the transition
        card.setInteractive(false);
        // getTweensForObject(card.scene, card).forEach(x => x.complete());

        
        SOUND_ACTIVE && SoundManager.instance.cardToFoundation.play()
        // Create a tween to move the card visually to the foundation pile
        card.scene.tweens.add({
            targets: card,
            x: targetX,
            y: targetY,
            duration: TABLEU_STACK_TWEEN_DURATION-2, // Adjust as needed
            ease: 'Cubic.easeOut',
            onComplete: () => {

                card.x= targetX;
                card.y= targetY

                // Optionally, call additional completion logic
                if (onComplete) onComplete();

                // Re-enable interaction
                card.setInteractive(true);
                card.setFaceUp(true)


            }
        });
        card.setDepth (12000);
        gameplayContainer.sort("depth");
    }
  

    moveTopCardStockToWaste(card: Card, index : number, stockPile: any[], wastePile: any[], gameplayContainer: Phaser.GameObjects.Container, onComplete?: () => void) 
    {

        SOUND_ACTIVE && SoundManager.instance.valid.play()
        getTweensForObject(card.scene, card).forEach(x => x.remove());
        if (card) {

            card.inTransition = true;
            card.scene.tweens.add({
                targets: card,
                x: STOCK_COORDS.x[RIGHT_HANDED_MODE_IDX]+WASTE_DELTA_FROM_STOCK[RIGHT_HANDED_MODE_IDX],
                y: STOCK_COORDS.y,
                duration: 160, // Adjust the duration as needed
                ease: 'Cubic.easeOut',
                onComplete: () => {
                    card.inTransition = false
                    if (onComplete) onComplete();
                    card.x = STOCK_COORDS.x[RIGHT_HANDED_MODE_IDX]+WASTE_DELTA_FROM_STOCK[RIGHT_HANDED_MODE_IDX]
                    card.y = STOCK_COORDS.y
                }, 
               
            });

            card.setDepth (11000);
            gameplayContainer.sort("depth");
        }
    }

    // Flip the card with animation (from back to front or vice versa)
    flipCard(card: Card, duration: number = 300, onComplete?: () => void) {
        
        if (card.isBeingFlipped) return;
        card.isBeingFlipped = true;
        card.scene.tweens.add({
            targets: card,
            scaleX: 0, // Shrink to zero width to simulate a flip
            duration: duration / 2,
            onComplete: () => {
                // Swap textures and then expand back to normal size
                card.scaleX = 0;
                card.flip();
                
                card.scene.tweens.add({
                    targets: card,
                    scaleX: CARD_SCALE,
                    duration: duration / 2,
                    onComplete: () => {
                        if (onComplete) onComplete();
                        card.isBeingFlipped = false;
                        card.scaleX = CARD_SCALE;
                    }
                });
            }
        });
    }


}

export default CardTransitionManager;

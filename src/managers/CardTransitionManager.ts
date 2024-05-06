import { PileType } from '../config/Consts';
import Card from '../elements/Card'; // Adjust import path as needed

class CardTransitionManager {
    private scene: Phaser.Scene;

    constructor(scene: Phaser.Scene) {
        this.scene = scene;
    }

    // Transition a card smoothly from one position to another
    moveCardWithTransition(card: Card, targetX: number, targetY: number, duration: number = 500, onComplete?: () => void) {
        this.scene.tweens.add({
            targets: card,
            x: targetX,
            y: targetY,
            duration,
            ease: 'Cubic.easeInOut',
            onComplete: () => {
                if (onComplete) onComplete();
            }
        });
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

    // Transition a card to a pile based on the target pile type
    moveCardToPile(card: Card, targetX: number, targetY: number, targetPileType: PileType, targetPileIndex: number, duration: number = 500, onComplete?: () => void) {
        // Example: Validate movement based on pile type, if needed

        // Animate the card to the target position
        this.moveCardWithTransition(card, targetX, targetY, duration, () => {
            // Update the card's internal state (e.g., pile type)
            card.setPile(targetPileType, targetPileIndex);
            if (onComplete) onComplete();
        });
    }
}

export default CardTransitionManager;

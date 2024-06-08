// CardLayoutManager.ts
import { CARD_SCALE, FOUNDATION_COORDS_DELTA, FOUNDATION_COORDS_INIT, STOCK_COORDS, TABLEU_COORDS_DELTA, TABLEU_COORDS_INIT, WASTE_DELTA_FROM_STOCK, WASTE_OVERLAP } from "../config/Consts";
import Card from "../elements/Card";
import { Rank, Suit } from "./CardNameManager";
import CardTransitionManager from "./CardTransitionManager";
import PileManager from "./PileManager";
class CardLayoutManager {

    stockpile: Card[];
    wastepile: Card[];
    tableauPiles: Card[][];
    foundationPiles: Card[][];
    pileManager: PileManager;

    init(pileManager : PileManager)
    {
        this.pileManager = pileManager;;
    }

    layoutAll(pileManager : PileManager, withTween : boolean = false) 
    {
        console.log("layout all")
        this.init(pileManager)
        this.layoutStockPile(pileManager.getStockPile())
        this.layoutWastePile(pileManager.getWastePile())
        this.layoutTableauPiles(pileManager.getTableauPiles(), withTween)
        this.layoutFoundationPiles(pileManager.getFoundationPiles())
        
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
            card.finishTweens()
            card.x = STOCK_COORDS.x + WASTE_DELTA_FROM_STOCK + index * WASTE_OVERLAP; // Overlapping horizontally for each card
            card.y = STOCK_COORDS.y;
            card.setDepth(index); // Correct stacking order for waste pile
            // console.log(card.getName())

        });
    }

    layoutTableauPile(tableauPiles : Array<Array<Card>>, pileIndex: number, withTween : boolean = false) 
    {
        console.log("lyout tableu pile: " + pileIndex, withTween);
       let pile = tableauPiles[pileIndex];

       const x = TABLEU_COORDS_INIT.x + pileIndex * TABLEU_COORDS_DELTA.x; // Adjust horizontal spacing
       let y = TABLEU_COORDS_INIT.y; // Initialize the y coordinate for the first card in the pile

       pile.forEach((card, cardIndex) => {
           if (withTween && this.pileManager) {
               this.pileManager.cardTransitionManager.moveWithTween(card, x, y)
           }
           else
           {
               card.x = x;
               card.y = y;
           }

           if (card.isFaceUp) {
           console.log(this.pileManager)
               if (this.pileManager) {
                   y += this.pileManager.getTableuCardsDeltaYForPile(pileIndex); // Use larger vertical offset for face-up cards
               }
               else
               {
                   y += TABLEU_COORDS_DELTA.y;
               }
               
           } else {
               y += TABLEU_COORDS_DELTA.y_covered; // Use smaller vertical offset for face-down cards
           }

           if (card.inTransition) {
            card.setDepth(20000 + cardIndex)
            // console.log("set depth for transition: " + card.getName())
           }
           else
           {
            card.setDepth(pileIndex * 100 + cardIndex); // Ensure correct stacking order
           }


           card.scale = CARD_SCALE;
       });
   
       
    }

    // Add more layout methods for additional pile types or special layouts...
    // Layout method for the tableau piles
    layoutTableauPiles(tableauPiles: Array<Array<Card>>, withTween : boolean = false) {
        tableauPiles.forEach((pile, pileIndex) => {
            this.layoutTableauPile(tableauPiles, pileIndex, withTween);
        });
    }
    

    // Layout method for the foundation piles
    layoutFoundationPiles(foundationPiles: Array<Array<Card>>, baseX: number = 700, baseY: number = 100, horizontalOffset: number = 150) {
        foundationPiles.forEach((pile, pileIndex) => {
            const x = baseX + pileIndex * horizontalOffset; // Adjust horizontal spacing
            pile.forEach((card, cardIndex) => {
                card.removeTweens()
                card.x = FOUNDATION_COORDS_INIT.x + pileIndex * FOUNDATION_COORDS_DELTA.x;
                card.y = FOUNDATION_COORDS_INIT.y;
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

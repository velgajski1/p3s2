// CardLayoutManager.ts
import { RIGHT_HANDED_MODE_ACTIVE, RIGHT_HANDED_MODE_IDX, STOCK_THREE_MODE_ACTIVE } from "../config/Config";
import { CARD_SCALE, FOUNDATION_COORDS_DELTA, FOUNDATION_COORDS_INIT, HINT_OVERLAY_DURATION, STOCK_COORDS, TABLEU_COORDS_DELTA, TABLEU_COORDS_INIT, WASTE_DELTA_FROM_STOCK, WASTE_DELTA_X, WASTE_OVERLAP } from "../config/Consts";
import Card from "../elements/Card";
import { Rank, Suit } from "./CardNameManager";
import CardTransitionManager from "./CardTransitionManager";
import ControlManager from "./ControlManager";
import PileManager from "./PileManager";
class CardLayoutManager {


    stockpile: Card[];
    wastepile: Card[];
    tableauPiles: Card[][];
    foundationPiles: Card[][];
    pileManager: PileManager;
    stockIndicator: Phaser.GameObjects.Sprite;
    wasteIndicator: Phaser.GameObjects.Sprite;
    tabIndicators: Phaser.GameObjects.Sprite[];
    foundIndicators: Phaser.GameObjects.Sprite[];
    outline: Phaser.GameObjects.Sprite;
    hintTimerEvent: any;
    timeout: NodeJS.Timeout;

    init(pileManager : PileManager)
    {
        this.pileManager = pileManager;
        addEventListener('rightHandedEvent', () => {this.update()});

        setTimeout(() => {
            // console.log("test hint")
        //    this.hintStock()
        //    this.hintWaste()
        //    this.hintTabIdx(2)
        //    this.hintFoundIdx(3)
              
        }, 5000);
    }

    layoutAll(pileManager : PileManager, withTween : boolean = false) 
    {
        
        this.init(pileManager)
        this.layoutStockPile(pileManager.getStockPile())
        this.layoutWastePile(pileManager.getWastePile())
        this.layoutTableauPiles(pileManager.getTableauPiles(), withTween)
        this.layoutFoundationPiles(pileManager.getFoundationPiles())


        
    }
    // Layout method for stock pile, usually a single stack
    layoutStockPile(cards: Card[]) {
        cards.forEach((card, index) => {
            card.x = STOCK_COORDS.x[RIGHT_HANDED_MODE_IDX];
            card.y = STOCK_COORDS.y;
            card.scale = CARD_SCALE
            card.setDepth(index); // Ensure stacking order for the stock
            card.setFaceUp(false);
        });
    }

    // Layout method for waste pile, which might have slight overlap
    layoutWastePile(cards: Card[], skipAnim:boolean = true) {
        
        cards.forEach((card, index) => {
            // 
            let wDeltaX : number = WASTE_DELTA_X[RIGHT_HANDED_MODE_IDX]
            card.finishTweens()
            card.wasteDeltaX = 0;
            if (cards.length > 2) {
                if (index == cards.length-3) card.wasteDeltaX = wDeltaX * 0
                if (index == cards.length-2) card.wasteDeltaX = wDeltaX * 1
                if (index == cards.length-1) card.wasteDeltaX = wDeltaX * 2
            }else if (cards.length == 2) {
                if (index == cards.length-2) card.wasteDeltaX = wDeltaX * 0
                if (index == cards.length-1) card.wasteDeltaX = wDeltaX * 1 
            }else {
                if (index == cards.length-1) card.wasteDeltaX = wDeltaX * 0 
            }

            if (STOCK_THREE_MODE_ACTIVE == false) card.wasteDeltaX = 0;
            
            let rightHandeWasteDelta = 0;
            if (RIGHT_HANDED_MODE_ACTIVE) {
                rightHandeWasteDelta =-60;
            }
            card.wasteDeltaX += rightHandeWasteDelta;
            let targetX = STOCK_COORDS.x[RIGHT_HANDED_MODE_IDX] + WASTE_DELTA_FROM_STOCK[RIGHT_HANDED_MODE_IDX] + index * WASTE_OVERLAP + card.wasteDeltaX;
            let targetY =  STOCK_COORDS.y
            if (skipAnim) {
                card.x = targetX // Overlapping horizontally for each card
                card.y = targetY;
                card.setDepth(index);
            }
            else 
            {
                card.setDepth (11000);
                card.scene.tweens.add({
                    targets: card,
                    x:targetX,
                    y:targetY,
                    duration: 100,
                    onComplete: ()=> {
                        card.setDepth(index);
                    }
                });
            }




             // Correct stacking order for waste pile

        });
    }

    layoutTableauPile(tableauPiles : Array<Array<Card>>, pileIndex: number, withTween : boolean = false) 
    {
        
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
           
               if (this.pileManager) {
                   y += this.pileManager.getTableuCardsDeltaYForPile(pileIndex); // Use larger vertical offset for face-up cards
               }
               else
               {
                   y += TABLEU_COORDS_DELTA.y;
                  
                  
               }
               
           } else {
               y += TABLEU_COORDS_DELTA.y_covered; // Use smaller vertical offset for face-down cards
               console.log("y pos: " + y);
           }

           if (card.inTransition) {
            card.setDepth(20000 + cardIndex)
            // 
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
                card.x = FOUNDATION_COORDS_INIT.x[RIGHT_HANDED_MODE_IDX] + pileIndex * FOUNDATION_COORDS_DELTA.x[RIGHT_HANDED_MODE_IDX];
                card.y = FOUNDATION_COORDS_INIT.y;
                card.setDepth(1000 + pileIndex * 10 + cardIndex); // Ensure correct stacking order
            });
        });
    }


    // Add visual indicators for the foundation piles
    addFoundationIndicators(scene: Phaser.Scene, cont : Phaser.GameObjects.Container) {
        this.foundIndicators = [];
        for (let i = 0; i < 4; i++) {
            const x = FOUNDATION_COORDS_INIT.x[RIGHT_HANDED_MODE_IDX] + i * FOUNDATION_COORDS_DELTA.x[RIGHT_HANDED_MODE_IDX];
            const y = FOUNDATION_COORDS_INIT.y;

            // Create a sprite for the foundation indicator
            const foundationIndicator = scene.add.sprite(x, y, 'holder_foundation_cards');
            foundationIndicator.setDepth(9000); // Ensure the indicator is below cards
            cont.add(foundationIndicator);
            // Optionally, customize the indicator with scale or tint
            foundationIndicator.setScale(CARD_SCALE);
            // foundationIndicator.setTint(0xaaaaaa); // Example: Slight gray tint
            this.foundIndicators[i] = foundationIndicator;
        }
    }

    addHintOutline(scene: Phaser.Scene, sprite: Phaser.GameObjects.Sprite, deltaX : number = 0, deltaY : number = 0) {
        this.removeHintOutline()
        this.outline = scene.add.sprite(sprite.x-1, sprite.y-1, 'reddish_glow_outline' ).setScale(sprite.scale)
        scene.add.existing(this.outline)
        this.outline.setDepth(100000)
        sprite.parentContainer.add(this.outline)
        this.outline.x+=deltaX
        this.outline.y+=deltaY


        this.removeHintTimer()
        this.timeout = setTimeout(() => {
            this.removeHintOutline()
        }, HINT_OVERLAY_DURATION);

     }

     removeHintOutline() {
        if (this.outline) this.outline.destroy();
    }

    removeHintTimer()
    {
        if (this.timeout) {
            clearTimeout(this.timeout)
        }
    }

    hintTabIdx(idx : number) {
        let spr = this.tabIndicators[idx]
        this.addHintOutline(spr.scene, spr);
    }

    hintFoundIdx(idx : number) {
        let spr = this.foundIndicators[idx]
        this.addHintOutline(spr.scene, spr, 1, 1);
    }

    hintStock() {
        let spr = this.stockIndicator
        this.addHintOutline(spr.scene, spr, 1, 1);
    }

    hintWaste() {
        let spr = this.wasteIndicator
        
        let wastePileLen = this.pileManager.getWastePile().length;
        if (wastePileLen==0) {
            this.addHintOutline(spr.scene, spr, 1, 1);
        }
        else {
            this.pileManager.getTopCardFromWaste()?.startHintAnim(0)
        }
    }

    addTableuIndicators(scene : Phaser.Scene, cont : Phaser.GameObjects.Container) {
        this.tabIndicators = [];
        for (let i = 0; i < 7; i++) {
            const x = TABLEU_COORDS_INIT.x + i * TABLEU_COORDS_DELTA.x;
            const y = TABLEU_COORDS_INIT.y;

            // Create a sprite for the foundation indicator
            const tabIndicator = scene.add.sprite(x, y, 'holder_tableau_cards'); //
            tabIndicator.setDepth(-100); // Ensure the indicator is below cards
            cont.add(tabIndicator);
            // Optionally, customize the indicator with scale or tint
            tabIndicator.setScale(CARD_SCALE);
            // foundationIndicator.setTint(0xaaaaaa); // Example: Slight gray tint
            this.tabIndicators[i] = tabIndicator;



        }
    }


    // Add a visual indicator for the waste pile
    addWasteIndicator(scene: Phaser.Scene, cont: Phaser.GameObjects.Container) {
        // Create a sprite for the waste pile indicator
        this.wasteIndicator = scene.add.sprite(STOCK_COORDS.x[RIGHT_HANDED_MODE_IDX]+WASTE_DELTA_FROM_STOCK[RIGHT_HANDED_MODE_IDX], STOCK_COORDS.y, 'holder_foundation_cards');
        this.wasteIndicator.setDepth(-9000); // Ensure the indicator is below cards
        this.wasteIndicator.setScale(CARD_SCALE);
        cont.add(this.wasteIndicator);
    }    
    // Add a visual indicator for the stock pile
    addStockIndicator(pileManager: PileManager, scene: Phaser.Scene, cont: Phaser.GameObjects.Container) {
        // Create a sprite for the waste pile indicator
        this.stockIndicator = scene.add.sprite(STOCK_COORDS.x[RIGHT_HANDED_MODE_IDX], STOCK_COORDS.y, 'holder_stock_cards');
        this.stockIndicator.setDepth(-9000); // Ensure the indicator is below cards
        this.stockIndicator.setScale(CARD_SCALE);
        cont.add(this.stockIndicator);

        // Make the indicator interactive and listen for clicks
        this.stockIndicator.setInteractive();
        this.stockIndicator.on('pointerdown', () => {
            pileManager.moveAllCardsFromWasteToStock(); // Move all cards from waste back to stock
        });
    }

    updateStockIndicator() {
        this.stockIndicator.setX(STOCK_COORDS.x[RIGHT_HANDED_MODE_IDX])
    }

    updateWasteIndicator() {
        this.wasteIndicator.setX(STOCK_COORDS.x[RIGHT_HANDED_MODE_IDX]+WASTE_DELTA_FROM_STOCK[RIGHT_HANDED_MODE_IDX])
    }

    updateTabIndicators() {
        this.tabIndicators.forEach((tabId, i) => {
            tabId.setX(TABLEU_COORDS_INIT.x + i * TABLEU_COORDS_DELTA.x)
        })
    }

    updateFoundIndicators() {
        this.foundIndicators.forEach((fid, i) => {
            fid.setX(FOUNDATION_COORDS_INIT.x[RIGHT_HANDED_MODE_IDX] + i * FOUNDATION_COORDS_DELTA.x[RIGHT_HANDED_MODE_IDX])
        })
    }
        
    update() {
        this.updateStockIndicator();
        this.updateWasteIndicator();
        this.updateFoundIndicators();
        this.layoutStockPile(this.pileManager.getStockPile())
        this.layoutWastePile(this.pileManager.getWastePile())
        this.layoutFoundationPiles(this.pileManager.getFoundationPiles())
    }

    
}

export default CardLayoutManager;

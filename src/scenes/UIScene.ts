import Phaser from 'phaser';
import { LanguageConfig } from '../config/Language';
import { GameManager } from '../managers/GameManager';
import { translate } from '../utils/Language';
import { formatTime } from '../utils/Utils';
import ToggleSwitch from '../ui/ToggleSwitch';
import Registry from '../config/Registry';
import ImageButton from '../ui/ImageButton';
import { STOCK_THREE_MODE_ACTIVE, toggleThreeModeActive } from '../config/Config';
import CardLayoutManager from '../managers/CardLayoutManager';

export class UIScene extends Phaser.Scene {
    textContainer: Phaser.GameObjects.Container;
    private scoreText: Phaser.GameObjects.Text;
    private timeText: Phaser.GameObjects.Text;
    private gameManager: GameManager; // Reference to the GameManager
    movesText: Phaser.GameObjects.Text;
    elementsContainer: Phaser.GameObjects.Container;
    menuBut: ImageButton;
    settingsBut: ImageButton;
    hintBut: ImageButton;
    undoBut: ImageButton;

    constructor() {
        super('UIScene');
    }


    create(): void {
        // Create UI elements here
        this.textContainer = this.add.container(0, 0);
        this.elementsContainer = this.add.container(0, 0);
        const textStyle: Phaser.Types.GameObjects.Text.TextStyle = { 
            fontSize: '19px', 
            color: '#FFFFFF', 
            fontFamily: 'Open Sans'
        };

        this.createTextElements();
        this.createUIElements()
        this.gameManager = this.registry.get('gameManager');


        this.scale.on('resize', this.resize, this);
        this.resize(this.scale.gameSize as unknown as Phaser.Structs.Size);
    }
    createUIElements()
    {
              // Instantiate the ToggleSwitch
        let deltaX = -440
        const toggleSwitch = new ToggleSwitch(
            this,
            -10 + deltaX,
            0,
            'klondike_1_turn', // 1-card pull off texture
            'klondike_1_turn_selected', // 1-card pull on texture
            'klondike_3_turn', // 3-card pull off texture
            'klondike_3_turn_selected', // 3-card pull on texture
            80, 
            0,
            (nextState: boolean) => {
                // console.log(`Next state: ${nextState}`);
                // You can add more logic here to handle the toggle action
                toggleThreeModeActive(nextState);
                this.gameManager = this.registry.get('gameManager');
                this.gameManager.layoutManager.layoutWastePile(this.gameManager.pileManager.getWastePile())
                console.log(STOCK_THREE_MODE_ACTIVE)
            }
        );

         this.elementsContainer.add(toggleSwitch);

         this.menuBut = new ImageButton(this, 160+deltaX, 0, 'menu', 'menu', () => {
            
         })
         this.elementsContainer.add(this.menuBut)
         this.menuBut.setOrigin(0, 0);

         this.settingsBut = new ImageButton(this, 220+deltaX, 0, 'settings', 'settings', () => {
            
         })
         this.elementsContainer.add(this.settingsBut)
         this.settingsBut.setOrigin(0, 0);

         this.hintBut = new ImageButton(this, 280+deltaX, 0, 'hint', 'hint', () => {
            
         })
         this.elementsContainer.add(this.hintBut)
         this.hintBut.setOrigin(0, 0);

         this.undoBut = new ImageButton(this, 360+deltaX, 0, 'undo', 'undo', () => {
            
         })
         this.elementsContainer.add(this.undoBut)
         this.undoBut.setOrigin(0, 0);
    }

    update(time: number, delta: number): void
    {
        // 
        this.scoreText.text = ""+translate(LanguageConfig.Score)+this.gameManager.getCurrentScore()
        this.timeText.text = " | "+translate(LanguageConfig.Time) + formatTime(this.gameManager.getElapsedTime())
        this.movesText.text = " | "+translate(LanguageConfig.Moves) +this.gameManager.getMoves()
        this.updateTextPos()
    }

    private createTextElements(): void {
        // Text style
        const textStyle: Phaser.Types.GameObjects.Text.TextStyle = {
            fontSize: '19px',
            color: '#FFFFFF',
            fontFamily: 'Open Sans',
        };

        // Score text
        this.scoreText = this.add.text(-350+350, 0, '', textStyle);

        // Time text
        this.timeText = this.add.text(-275+350, 0, '', textStyle);       
        
        // Time text
        this.movesText = this.add.text(-150+350, 0, '', textStyle);

        this.textContainer.add(this.scoreText)
        this.textContainer.add(this.timeText)
        this.textContainer.add(this.movesText)
   
    }

    private resize(gameSize: Phaser.Structs.Size): void {
        
        const { width, height } = gameSize;
        
        let textStartX = Registry.uiTextStartX;
        let elementsStartX = Registry.uiElemStartX;
        this.textContainer.setPosition(textStartX, 0);
        this.elementsContainer.setPosition(elementsStartX, 0);
        let scale = Math.min(1, Math.min(width / 1600, height / 900));
        let fontsize = Math.max(12, Math.ceil(22 * Math.sqrt(scale))); 
        this.elementsContainer.x = elementsStartX;
        this.elementsContainer.setScale(scale)

        const textStyle: Phaser.Types.GameObjects.Text.TextStyle = {
            fontSize: fontsize+'px',
            color: '#FFFFFF',
            fontFamily: 'Open Sans',
        };

        this.scoreText.setStyle(textStyle)
        this.timeText.setStyle(textStyle)
        this.movesText.setStyle(textStyle)
        this.calculateContainerHeightPercentage(height)
        this.updateTextPos()
        

        
    }

    private calculateContainerHeightPercentage(screenHeight: number): void {
        // Assuming original dimensions of the gameplay container (for example purposes)
          // @ts-ignore
          
           // @ts-ignore
        const originalContainerHeight = this.textContainer.y + window.topBarBottomPosition; // Adjust this to your container's original height
        
        // Get the current scale applied to the container
        const currentScale = this.textContainer.scaleY;
        

        // Calculate the scaled height of the container
        const scaledContainerHeight = originalContainerHeight * currentScale;

        // Calculate the percentage of the screen height taken by the container
        const heightPercentage = (scaledContainerHeight / screenHeight) * 100;

        // Log the percentage
        
        this.registry.set('topUiWidthPercentage', 1.5*heightPercentage/100)
    }
    updateTextPos(){
        this.timeText.x = this.scoreText.x + this.scoreText.width
        this.movesText.x = this.timeText.x + this.timeText.width

        let topUI = this.registry.get("topUiWidthPercentage");
        if (topUI==undefined) topUI = 0.01;

        
        
        this.elementsContainer.y = topUI*this.scale.height
        this.textContainer.y = topUI*this.scale.height

        
        this.registry.set("uiBottomPx", this.elementsContainer.y + this.scoreText.height*2.5)

        if (this.registry.get("isFullscreen")) {
            this.elementsContainer.y = this.scale.height *0.95
            this.textContainer.y = this.scale.height * 0.95
        }

    }

    public setTime(time: number) : void {
        
    }
}

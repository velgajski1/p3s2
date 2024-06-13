import Phaser from 'phaser';
import { LanguageConfig } from '../config/Language';
import { GameManager } from '../managers/GameManager';
import { translate } from '../utils/Language';
import { formatTime } from '../utils/Utils';
import ToggleSwitch from '../ui/ToggleSwitch';
import Registry from '../config/Registry';

export class UIScene extends Phaser.Scene {
    textContainer: Phaser.GameObjects.Container;
    private scoreText: Phaser.GameObjects.Text;
    private timeText: Phaser.GameObjects.Text;
    private gameManager: GameManager; // Reference to the GameManager
    movesText: Phaser.GameObjects.Text;
    elementsContainer: Phaser.GameObjects.Container;

    constructor() {
        super('UIScene');
    }


    create(): void {
        // Create UI elements here
        this.textContainer = this.add.container(0, 30);
        this.elementsContainer = this.add.container(0, 60);
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
        const toggleSwitch = new ToggleSwitch(
        this,0,0,
        'klondike_1_turn', // 1-card pull off texture
        'klondike_1_turn_selected', // 1-card pull on texture
        'klondike_3_turn', // 3-card pull off texture
        'klondike_3_turn_selected'  // 3-card pull on texture
         );

         this.elementsContainer.add(toggleSwitch);
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
        this.scoreText = this.add.text(-350+350, 20, '', textStyle);

        // Time text
        this.timeText = this.add.text(-275+350, 20, '', textStyle);       
        
        // Time text
        this.movesText = this.add.text(-150+350, 20, '', textStyle);

        this.textContainer.add(this.scoreText)
        this.textContainer.add(this.timeText)
        this.textContainer.add(this.movesText)
   
    }

    private resize(gameSize: Phaser.Structs.Size): void {
        
        const { width, height } = gameSize;
        
        let textStartX = Registry.uiTextStartX;
        let elementsStartX = Registry.uiElemStartX;
        this.textContainer.setPosition(textStartX, 30);
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
        this.updateTextPos()
        this.calculateContainerHeightPercentage(height)
    }

    private calculateContainerHeightPercentage(screenHeight: number): void {
        // Assuming original dimensions of the gameplay container (for example purposes)
        const originalContainerHeight = this.textContainer.y + 20 +22; // Adjust this to your container's original height
        
        // Get the current scale applied to the container
        const currentScale = this.textContainer.scaleY;
        console.log(originalContainerHeight, this.textContainer.y, this.textContainer.height, currentScale)

        // Calculate the scaled height of the container
        const scaledContainerHeight = originalContainerHeight * currentScale;

        // Calculate the percentage of the screen height taken by the container
        const heightPercentage = (scaledContainerHeight / screenHeight) * 100;

        // Log the percentage
        console.log('Text container height percentage:', heightPercentage + '%');
        this.registry.set('topUiWidthPercentage', heightPercentage/100)
    }
    updateTextPos(){
        this.timeText.x = this.scoreText.x + this.scoreText.width
        this.movesText.x = this.timeText.x + this.timeText.width

    }

    public setTime(time: number) : void {
        
    }
}

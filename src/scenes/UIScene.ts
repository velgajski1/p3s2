import Phaser, { GameObjects } from 'phaser';
import { LanguageConfig } from '../config/Language';
import { GameManager } from '../managers/GameManager';
import { translate } from '../utils/Language';
import { formatTime } from '../utils/Utils';
import ToggleSwitch from '../ui/ToggleSwitch';
import Registry from '../config/Registry';
import ImageButton from '../ui/ImageButton';
import { DRAG_ACTIVE, STOCK_THREE_MODE_ACTIVE, toggleThreeModeActive } from '../config/Config';
import CardLayoutManager from '../managers/CardLayoutManager';
import UndoManager from '../managers/UndoManager';
import { MainMenu } from './MainMenu';
import HintManager from '../managers/HintManager';
import ControlManager from '../managers/ControlManager';

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
    inputEnabled: boolean =  true;
    allInteractive : [ImageButton];
    toggleSwitch: ToggleSwitch;

    constructor() {
        super('UIScene');
    }



    create(): void {
        // Create UI elements here
        this.textContainer = this.add.container(0, 0);
        this.elementsContainer = this.add.container(0, 0);
        const textStyle: Phaser.Types.GameObjects.Text.TextStyle = { 
            fontSize: '18px', 
            color: '#FFFFFF', 
            fontFamily: 'Open Sans',
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
        this.toggleSwitch = new ToggleSwitch(
            this,
            -2+deltaX,
            0,
            'klondike_1_turn', // 1-card pull off texture
            'klondike_1_turn_selected', // 1-card pull on texture
            'klondike_3_turn', // 3-card pull off texture
            'klondike_3_turn_selected', // 3-card pull on texture
            81, 
            0,
            (nextState: boolean) => {
                if (!this.inputEnabled) return;
                // 
                // You can add more logic here to handle the toggle action
                console.log("toglle swithc called")
                var gamemanager : GameManager = this.registry.get("gameManager")
                gamemanager.updateStats()
                toggleThreeModeActive(nextState);
                gamemanager.restart()
                // this.remove()

            },
            STOCK_THREE_MODE_ACTIVE
        );

         this.elementsContainer.add(this.toggleSwitch);
     

         this.menuBut = new ImageButton(this, 160+deltaX, 0, 'menu', 'menu', () => {
            if (!this.inputEnabled) return;
            if (this.scene.getIndex('MainMenu')>-1) {
                this.scene.launch("MainMenu").bringToTop("MainMenu");
            }
            else if (this.scene) {
                this.scene.start("MainMenu").bringToTop("MainMenu");
            } 

            this.input.setDefaultCursor('default');
            
         })
         this.elementsContainer.add(this.menuBut)
         this.menuBut.setOrigin(0, 0);

         this.settingsBut = new ImageButton(this, 220+deltaX, 0, 'settings', 'settings', () => {
            if (!this.inputEnabled) return;
            this.scene.launch("Settings").bringToTop("Settings");
            this.input.setDefaultCursor('default');
         })
         this.settingsBut.setDepth(50000)
         this.elementsContainer.add(this.settingsBut)
         this.settingsBut.setOrigin(0, 0);

         this.hintBut = new ImageButton(this, 280+deltaX, 0, 'hint', 'hint', () => {
            if (!this.inputEnabled) return;
            let gamemanager : GameManager = this.registry.get('gameManager')
            HintManager.getInstance().getHint(gamemanager.pileManager)
            
         })
         this.hintBut.skipClickSound = true;
         this.elementsContainer.add(this.hintBut)
         this.hintBut.setOrigin(0, 0);

         this.undoBut = new ImageButton(this, 360+deltaX, 0, 'undo', 'undo', () => {
            if (!this.inputEnabled) return;
            this.gameManager = this.registry.get("gameManager")
            this.gameManager.controlManager.handleUKey()
         })
         this.elementsContainer.add(this.undoBut)
         this.undoBut.setOrigin(0, 0);
         this.undoBut.skipClickSound = true


         
    }

    update(time: number, delta: number): void
    {
        // 
        this.scoreText.text = ""+translate(LanguageConfig.Score)+this.gameManager.getCurrentScore()
        this.timeText.text = " | "+translate(LanguageConfig.Time) + formatTime(this.gameManager.getElapsedTime())
        this.movesText.text = " | "+translate(LanguageConfig.Moves) +this.gameManager.getMoves()
        this.updateTextPos()

        this.inputEnabled = true

        if (DRAG_ACTIVE) {
            this.hintBut.disableInteractive()
            this.menuBut.disableInteractive()
            this.undoBut.disableInteractive()
            this.settingsBut.disableInteractive()
            this.toggleSwitch.icon1.disableInteractive()
            this.toggleSwitch.icon2.disableInteractive()
        } else {
            this.hintBut.setInteractive()
            this.menuBut.setInteractive()
            this.undoBut.setInteractive()
            this.settingsBut.setInteractive()
            this.toggleSwitch.icon1.setInteractive()
            this.toggleSwitch.icon2.setInteractive()
        }
        
        if (this.scene.isActive("Settings")||this.scene.isActive("MainMenu")||this.scene.isActive("Statistics")||this.scene.isActive("WonScene")) this.inputEnabled = false
    }

    private createTextElements(): void {
        // Text style
        const textStyle: Phaser.Types.GameObjects.Text.TextStyle = {
            fontSize: '19px',
            color: '#FFFFFF',
            fontFamily: 'Open Sans',
        };

        // Score text
        this.scoreText = this.add.text(-350+350, 7, '', textStyle);

        // Time text
        this.timeText = this.add.text(-275+350, 7, '', textStyle);       
        
        // Time text
        this.movesText = this.add.text(-150+350, 7, '', textStyle);

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
        let fontsize = Math.max(12, Math.ceil(20 * Math.sqrt(scale))); 
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
        
        console.log("resize called")
        if (this.game.device.os.android || this.game.device.os.iOS) {
            if (innerWidth > innerHeight) {
                this.handleMobileLandscape()
            } else {
                this.handleMobilePortrait()
            }
        }
        
    }
    handleMobileLandscape()
    {
        if(this.scale.isFullscreen) {
            this.elementsContainer.scale *= 2
            this.textContainer.scale *= 1.2
            console.log(this.elementsContainer.x)
            this.elementsContainer.x = window.innerWidth
            this.textContainer.x = 10
        }
        
    }
    handleMobilePortrait()
    {
        
            console.log("elem width: " + this.elementsContainer.width)
            this.elementsContainer.scale *= 3.5;
            // this.textContainer.scale *= 1.2
            console.log(this.elementsContainer.x)
            this.elementsContainer.x = window.innerWidth
            this.elementsContainer.y = window.innerHeight
        
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
        console.log("update text pos")
        this.timeText.x = this.scoreText.x + this.scoreText.width
        this.movesText.x = this.timeText.x + this.timeText.width

        let topUI = this.registry.get("topUiWidthPercentage");
        if (topUI==undefined) topUI = 0.01;

        // if (!this.game.device.os.windows)
        
        
        this.elementsContainer.y = topUI*this.scale.height
        this.textContainer.y = topUI*this.scale.height

        

        
        this.registry.set("uiBottomPx", this.elementsContainer.y + this.scoreText.height*2.9)

        if (this.registry.get("isFullscreen")) {
            this.elementsContainer.y = this.scale.height *0.925
            this.textContainer.y = this.scale.height * 0.925

            if (this.game.device.os.android || this.game.device.os.iOS) {
                this.elementsContainer.y = this.scale.height *0.9
                this.textContainer.y = this.scale.height * 0.9 
            }
        }
        else {
            this.textContainer.y = topUI*this.scale.height
            
            if (this.game.device.os.android || this.game.device.os.iOS) {
                if (!this.game.device.os.iPad) {
                    this.elementsContainer.y = this.scale.height *0.8
                } else if (this.game.device.os.iPad && innerHeight > innerWidth) {
                    this.elementsContainer.y = this.scale.height *0.8
                }
                
            }
        }

    }

    public setTime(time: number) : void {
        
    }
}

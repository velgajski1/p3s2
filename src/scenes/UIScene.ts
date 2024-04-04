import Phaser from 'phaser';
import { GameManager } from '../managers/GameManager';
import { formatTime } from '../utils/Utils';
import { Language, translate } from '../utils/Language';
import { LanguageConfig } from '../config/Language';

export class UIScene extends Phaser.Scene {
    gameplayContainer: Phaser.GameObjects.Container;
    private scoreText: Phaser.GameObjects.Text;
    private timeText: Phaser.GameObjects.Text;
    private gameManager: GameManager; // Reference to the GameManager
    movesText: Phaser.GameObjects.Text;

    constructor() {
        super('UIScene');
    }


    create(): void {
        // Create UI elements here
        this.gameplayContainer = this.add.container(this.scale.width / 2, this.scale.height / 2);
        const textStyle: Phaser.Types.GameObjects.Text.TextStyle = { 
            fontSize: '19px', 
            color: '#FFFFFF', 
            fontFamily: 'Open Sans'
        };

        this.createTextElements();
        this.gameManager = this.registry.get('gameManager');


        // Setup the initial UI state
        // this.scoreText.setText(`Score: ${this.gameManager.getCurrentScore()}`);
        // this.timeText.setText(`Time: ${formatTime(this.gameManager.getElapsedTime())}`);

        this.scale.on('resize', this.resize, this);
        this.resize(this.scale.gameSize as unknown as Phaser.Structs.Size);
    }

    update(time: number, delta: number): void
    {
        console.log("update: "+ this.gameManager.getCurrentScore())
        this.scoreText.text = ""+translate(LanguageConfig.Score)+this.gameManager.getCurrentScore()
        this.timeText.text = "  |  "+translate(LanguageConfig.Time) + formatTime(this.gameManager.getElapsedTime())
        this.movesText.text = "  |  "+translate(LanguageConfig.Moves) +this.gameManager.getMoves()
    }

    private createTextElements(): void {
        // Text style
        const textStyle: Phaser.Types.GameObjects.Text.TextStyle = {
            fontSize: '19px',
            color: '#FFFFFF',
            fontFamily: 'Open Sans',
        };

        // Score text
        this.scoreText = this.add.text(-350, -410, '', textStyle);

        // Time text
        this.timeText = this.add.text(-275, -410, '', textStyle);       
        
        // Time text
        this.movesText = this.add.text(-150, -410, '', textStyle);

        this.gameplayContainer.add(this.scoreText)
        this.gameplayContainer.add(this.timeText)
        this.gameplayContainer.add(this.movesText)
    }


    private resize(gameSize: Phaser.Structs.Size): void {
        const { width, height } = gameSize;
        this.gameplayContainer.setPosition(width / 2, height / 2+20);
        let scale = Math.min(1, Math.min(width / 1600, height / 900));
        this.gameplayContainer.setScale(scale);
        console.log(scale);
    }

    public setTime(time: number) : void {
        console.log(time);
    }
}

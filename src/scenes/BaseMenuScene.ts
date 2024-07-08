import Phaser from 'phaser';
import { GameManager } from '../managers/GameManager';

export class BaseMenuScene extends Phaser.Scene { 
    public isActive: boolean = false;
    modalBackground: Phaser.GameObjects.Graphics;

    constructor(sceneKey: string) {
        super(sceneKey);
    }

    create(): void {
        this.createModalBackground()
    }

    update(time: number, delta: number): void {
        // Check if the scene is currently active
        this.isActive = this.scene.isActive(this.scene.key);

        // Optionally, you can perform additional updates based on whether the scene is active
        if (this.isActive) {
            // Update logic for when the scene is active
        }
        // this.modalBackground
    }

    private createModalBackground(): void {
        console.log("createModalBackground")
        this.modalBackground = this.add.graphics({ fillStyle: { color: 0x000000, alpha: 0.5 } });
        this.modalBackground.fillRect(0, 0, this.scale.width, this.scale.height);
        this.modalBackground.setInteractive({useHandCursor: false, hitArea : new Phaser.Geom.Rectangle(0,0,this.scale.width, this.scale.height), hitAreaCallback:Phaser.Geom.Rectangle.Contains})
    }

    restartGame = () => {
        console.log("restart game called")
        var gamemanager : GameManager = this.registry.get("gameManager")
        gamemanager.restart()
        this.remove()
    }  

    remove() : void {
        // this.scene.setVisible(false)
        this.scene.sleep()
    }
}
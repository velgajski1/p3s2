import Phaser from 'phaser';
import { NIGHT_MODE_ACTIVE } from '../config/Config';

export class BackgroundScene extends Phaser.Scene {
    private bgTile: Phaser.GameObjects.TileSprite;

    constructor() {
        super('BackgroundScene');
    }

    create(): void {
        const { width, height } = this.scale.gameSize;
        this.bgTile = this.add.tileSprite(0, 0, width, height, this.currentKey()).setOrigin(0, 0);
        this.scale.on('resize', this.resizeTile, this);
    }

    public setNightMode(night: boolean): void {
        this.bgTile.setTexture(night ? 'bg-dark' : 'bg-light');
    }

    private currentKey(): string {
        return NIGHT_MODE_ACTIVE ? 'bg-dark' : 'bg-light';
    }

    private resizeTile(gameSize: Phaser.Structs.Size): void {
        if (!this.bgTile) return;
        this.bgTile.setSize(gameSize.width, gameSize.height);
    }
}

import Phaser from 'phaser';
import { NIGHT_MODE_ACTIVE } from '../config/Config';

export class BackgroundScene extends Phaser.Scene {
    private bgImage: Phaser.GameObjects.Image;

    constructor() {
        super('BackgroundScene');
    }

    create(): void {
        this.bgImage = this.add.image(0, 0, this.currentKey()).setOrigin(0, 0);
        this.fitToCanvas(this.scale.gameSize);
        this.scale.on('resize', this.fitToCanvas, this);
    }

    public setNightMode(night: boolean): void {
        this.bgImage.setTexture(night ? 'bg-dark' : 'bg-light');
        this.fitToCanvas(this.scale.gameSize);
    }

    private currentKey(): string {
        return NIGHT_MODE_ACTIVE ? 'bg-dark' : 'bg-light';
    }

    private fitToCanvas(gameSize: Phaser.Structs.Size): void {
        if (!this.bgImage) return;
        const { width, height } = gameSize;
        const src = this.bgImage.texture.getSourceImage();
        const srcW = (src as any).width;
        const srcH = (src as any).height;
        const scale = Math.max(width / srcW, height / srcH);
        this.bgImage.setScale(scale);
        this.bgImage.setPosition((width - srcW * scale) / 2, (height - srcH * scale) / 2);
    }
}

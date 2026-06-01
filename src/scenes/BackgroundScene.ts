import Phaser from 'phaser';
import { NIGHT_MODE_ACTIVE } from '../config/Config';

export class BackgroundScene extends Phaser.Scene {
    private bgImage: Phaser.GameObjects.Image;
    private bgTile: Phaser.GameObjects.TileSprite;

    constructor() {
        super('BackgroundScene');
    }

    create(): void {
        const { width, height } = this.scale.gameSize;
        const key = this.currentKey();
        this.bgImage = this.add.image(0, 0, key).setOrigin(0, 0).setVisible(false);
        this.bgTile = this.add.tileSprite(0, 0, width, height, key).setOrigin(0, 0).setVisible(false);
        this.applyMode(this.scale.gameSize);
        this.scale.on('resize', this.applyMode, this);
    }

    public refreshBackground(): void {
        this.applyMode(this.scale.gameSize);
    }

    private currentKey(): string {
        switch (NIGHT_MODE_ACTIVE) {
            case 1: return 'bg-dark';
            case 2: return 'bg-green';
            default: return 'bg-light';
        }
    }

    private applyMode(gameSize: Phaser.Structs.Size): void {
        if (!this.bgImage || !this.bgTile) return;
        const { width, height } = gameSize;
        const key = this.currentKey();
        this.bgImage.setTexture(key);
        this.bgTile.setTexture(key);

        const isLandscape = width >= height;
        // Cover-fit only the light wood in landscape. Dark and green always tile at native size
        // (CSS-equivalent: background-repeat: repeat; background-size: auto; background-position: top left).
        const useCover = isLandscape && key === 'bg-light';
        if (useCover) {
            this.bgTile.setVisible(false);
            this.bgImage.setVisible(true);
            const src = this.bgImage.texture.getSourceImage();
            const sw = (src as any).width;
            const sh = (src as any).height;
            const scale = Math.max(width / sw, height / sh);
            this.bgImage.setScale(scale);
            this.bgImage.setPosition((width - sw * scale) / 2, (height - sh * scale) / 2);
        } else {
            this.bgImage.setVisible(false);
            this.bgTile.setVisible(true);
            this.bgTile.setSize(width, height);
        }
    }
}

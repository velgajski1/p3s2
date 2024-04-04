import Phaser from 'phaser';

export class ImageButton extends Phaser.GameObjects.Container {
    private normalImage: Phaser.GameObjects.Image;
    private hoverImage: Phaser.GameObjects.Image;

    constructor(scene: Phaser.Scene, x: number, y: number, normalTexture: string, hoverTexture: string, onClick: () => void, options?: {
        parentContainer?: Phaser.GameObjects.Container
    }) {
        super(scene, x, y);

        // Default options
        const { parentContainer } = options || {};

        // Create normal and hover images
        this.normalImage = scene.add.image(0, 0, normalTexture).setVisible(true);
        this.hoverImage = scene.add.image(0, 0, hoverTexture).setVisible(false);

        // Add images to this container
        this.add([this.normalImage, this.hoverImage]);

        // Make the container interactive and setup event listeners
        this.setSize(this.normalImage.width, this.normalImage.height);
        this.setInteractive({ useHandCursor: true })
            .on('pointerdown', onClick)
            .on('pointerover', () => this.switchToHoverImage())
            .on('pointerout', () => this.switchToNormalImage());

        // Add this container to the scene or a parent container
        if (parentContainer) {
            parentContainer.add(this);
        } else {
            scene.add.existing(this);
        }
    }

    private switchToHoverImage(): void {
        this.normalImage.setVisible(false);
        this.hoverImage.setVisible(true);
    }

    private switchToNormalImage(): void {
        this.hoverImage.setVisible(false);
        this.normalImage.setVisible(true);
    }
}

export default ImageButton;

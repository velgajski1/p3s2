import Phaser from 'phaser';

interface ControlOptions {
    parentContainer?: Phaser.GameObjects.Container;
    // Define other properties as needed
}

export class ItemCycleControl extends Phaser.GameObjects.Container {
    private items: (string | number)[];
    private currentItemIndex: number = 0;
    private onChange: (item: string | number) => void;
    private titleText: Phaser.GameObjects.Text;
    private itemText: Phaser.GameObjects.Text;

    constructor(scene: Phaser.Scene, x: number, y: number, title: string, items: (string | number)[], onChange: (item: string | number) => void, options? :ControlOptions) {
        super(scene, x, y);
        this.items = items;
        this.onChange = onChange;

        // Title Text
        this.titleText = scene.add.text(0, -30, title, { fontSize: '24px', color: '#fff' }).setOrigin(0.5);

        // Item Text, showing the current item
        this.itemText = scene.add.text(0, 10, this.items[this.currentItemIndex].toString(), { fontSize: '24px', color: '#fff' }).setOrigin(0.5);

        // Left Button
        const btnLeft = scene.add.image(-50, 10, 'prompt_btn_left').setInteractive();
        btnLeft.on('pointerdown', () => this.cycleItem(-1));

        // Right Button
        const btnRight = scene.add.image(50, 10, 'prompt_btn_right').setInteractive();
        btnRight.on('pointerdown', () => this.cycleItem(1));

        // Add all components to the container
        this.add([this.titleText, this.itemText, btnLeft, btnRight]);

        // Initial call to onChange with the first item
        this.onChange(this.items[this.currentItemIndex]);

        // Add this container to the scene
        // Use options.parentContainer safely with proper TypeScript understanding
        if (options?.parentContainer) {
            options.parentContainer.add(this);
        } else {
            scene.add.existing(this);
        }
    }

    private cycleItem(direction: number) {
        // Update the current item index based on the direction and cycle through the items
        this.currentItemIndex += direction;
        if (this.currentItemIndex >= this.items.length) {
            this.currentItemIndex = 0; // Wrap to first
        } else if (this.currentItemIndex < 0) {
            this.currentItemIndex = this.items.length - 1; // Wrap to last
        }

        // Update the item text to show the current item
        this.itemText.setText(this.items[this.currentItemIndex].toString());

        // Trigger the onChange callback with the new current item
        this.onChange(this.items[this.currentItemIndex]);
    }
}

export default ItemCycleControl;
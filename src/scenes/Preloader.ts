import { Scene } from 'phaser';

export class Preloader extends Scene
{
    constructor ()
    {
        super('Preloader');
    }

    init ()
    {

        //  A simple progress bar. This is the outline of the bar.
        this.add.rectangle(512, 384, 468, 32).setStrokeStyle(1, 0xffffff);

        //  This is the progress bar itself. It will increase in size from the left based on the % of progress.
        const bar = this.add.rectangle(512-230, 384, 4, 28, 0xffffff);

        //  Use the 'progress' event emitted by the LoaderPlugin to update the loading bar
        this.load.on('progress', (progress: number) => {

            //  Update the progress bar (our bar is 464px wide, so 100% = 464px)
            bar.width = 4 + (460 * progress);

        });
    }

    preload ()
    {
        //  Load the assets for the game - Replace with your own assets
        this.load.setPath('assets');

        this.load.image('ace', 'ace.png');

        this.load.image('ace', 'ace.png');
        this.load.image('hint', 'hint.png');
        this.load.image('klondike_1_turn', 'klondike_1_turn.png');
        this.load.image('klondike_1_turn_selected', 'klondike_1_turn_selected.png');
        this.load.image('klondike_3_turn', 'klondike_3_turn.png');
        this.load.image('klondike_3_turn_selected', 'klondike_3_turn_selected.png');
        this.load.image('menu', 'menu.png');
        this.load.image('prompt_btn_left', 'prompt_btn_left.png');
        this.load.image('prompt_btn_right', 'prompt_btn_right.png');
        this.load.image('prompt_close', 'prompt_close.png');
        this.load.image('prompt_radio_off', 'prompt_radio_off.png');
        this.load.image('prompt_radio_on', 'prompt_radio_on.png');
        this.load.image('settings', 'settings.png');
        this.load.image('undo', 'undo.png');
        this.load.image('undo_na', 'undo_na.png');
    }

    create ()
    {
        //  When all the assets have loaded, it's often worth creating global objects here that the rest of the game can use.
        //  For example, you can define global animations here, so we can use them in other scenes.

        //  Move to the MainMenu. You could also swap this for a Scene Transition, such as a camera fade.
       
        this.scene.start('BackgroundScene');
        this.scene.launch('Settings');
       
        // this.scene.bringToTop('MainMenu');
        
    }
}

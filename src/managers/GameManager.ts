export class GameManager {


    private score: number = 0;
    private startTime: number;
    private elapsedTime: number = 0;
    private gameScene: Phaser.Scene;
    private moves: number = 0;


    constructor(gameScene: Phaser.Scene) {
        this.gameScene = gameScene;
        this.startTime = Date.now();

        // Set up an event to update the timer in the game loop
        this.gameScene.time.addEvent({
            delay: 1000,
            callback: this.updateTimer,
            callbackScope: this,
            loop: true
        });

   
    }

    startGame(): void {
        this.score = 0;
        this.startTime = Date.now();
        // Reset other game states if needed
    }

    incrementScore(amount: number): void {
        this.score += amount;

    }

    incrementMoves() : void {
        this.moves++;
    }

    updateTimer(): void {
        this.elapsedTime = Math.floor((Date.now() - this.startTime) / 1000);
    }

    getElapsedTime(): number
    {
       return this.elapsedTime;
    }
    getCurrentScore()
    {
        return this.score;
    }

    getMoves()
    {
        return this.moves;
    }

    // Additional game logic methods...
}
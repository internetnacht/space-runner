import Phaser from 'phaser'
import Player from "../components/Player.ts";

class StartingScreen extends Phaser.Scene {
    constructor () {
        super({
            key: 'StartingScreen',
            active: true
        });
    }

    preload () {
        Player.loadAssets(this)

        this.load.image('sky', 'assets/sprites/sky.png')
        this.load.image('ground', 'assets/sprites/platform.png')
        this.load.image('star', 'assets/sprites/star.png')
        this.load.image('bomb', 'assets/sprites/bomb.png')
    }

    create () {
        this.scene.start('Map')
    }
}

export default StartingScreen;
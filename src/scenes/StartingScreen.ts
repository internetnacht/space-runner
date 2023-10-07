import Phaser from 'phaser'
import Player from "../components/Player.ts";
import {worlds} from "../constants.ts";

class StartingScreen extends Phaser.Scene {
    constructor () {
        super({
            key: 'StartingScreen',
            active: true
        });
    }

    preload () {
        Player.loadAssets(this)

        this.load.image('sky', 'sprites/sky.png')
        this.load.image('ground', 'sprites/platform.png')
        this.load.image('star', 'sprites/star.png')
        this.load.image('bomb', 'sprites/bomb.png')
    }

    create () {
        for (const world of worlds) {
            this.scene.add(world.sceneKey, world)
        }

        this.scene.start('WorldSelectionMenu')
    }
}

export default StartingScreen;
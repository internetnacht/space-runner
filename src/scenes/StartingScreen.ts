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
    }

    create () {
        for (const world of worlds) {
            this.scene.add(world.sceneKey, world)
        }

        this.scene.start('WorldSelectionMenu')
    }
}

export default StartingScreen;
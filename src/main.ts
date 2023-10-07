import Phaser from 'phaser'
import { windowHeight, windowWidth} from "./constants.ts";
import StartingScreen from "./scenes/StartingScreen.ts";
import WorldSelectionMenu from "./scenes/WorldSelectionMenu.ts";
import World from "./scenes/World.ts";

const config = {
    type: Phaser.AUTO,
    width: windowWidth,
    height: windowHeight,
    scale: {
        mode: Phaser.Scale.NONE,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 600 },
            debug: false
        }
    },
    fps: {
        target: 30
    },
    scene: [
        StartingScreen,
        WorldSelectionMenu,
        World
    ],
    audio: {
        disableWebAudio: true
    }
};

export default new Phaser.Game(config)

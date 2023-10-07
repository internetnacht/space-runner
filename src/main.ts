import Phaser from 'phaser'
import { windowHeight, windowWidth} from "./constants.ts";
import StartingScreen from "./scenes/StartingScreen.ts";
import World1 from "./scenes/worlds/World1.ts";

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
        World1
    ],
    audio: {
        disableWebAudio: true
    }
};

export default new Phaser.Game(config)

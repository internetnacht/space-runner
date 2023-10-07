import Phaser from 'phaser'
import { windowHeight, windowWidth} from "./constants.ts";
import StartingScreen from "./scenes/StartingScreen.ts";
import World1 from "./scenes/worlds/World1.ts";
import World5 from "./scenes/worlds/World5.ts"
import WorldSelectionMenu from "./scenes/WorldSelectionMenu.ts";

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
        World1,
        World5
    ],
    audio: {
        disableWebAudio: true
    }
};

export default new Phaser.Game(config)

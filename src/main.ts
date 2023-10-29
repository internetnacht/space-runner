import Phaser from 'phaser'
import { MEASURES } from './constants.ts'
import StartingScreen from './scenes/StartingScreen.ts'
import WorldSelectionMenu from './scenes/WorldSelectionMenu.ts'
import World from './scenes/World.ts'
import PauseMenu from './scenes/PauseMenu.ts'

const config = {
	type: Phaser.AUTO,
	width: MEASURES.window.width,
	height: MEASURES.window.height,
	scale: {
		mode: Phaser.Scale.NONE,
		autoCenter: Phaser.Scale.CENTER_BOTH,
	},
	physics: {
		default: 'arcade',
		arcade: {
			gravity: { y: 900 },
			debug: false,
		},
	},
	fps: {
		target: 30,
	},
	scene: [StartingScreen, WorldSelectionMenu, World, PauseMenu],
	audio: {
		disableWebAudio: true,
	},
}

export default new Phaser.Game(config)

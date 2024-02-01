import Phaser from 'phaser'
import { DEBUG, MEASURES } from './constants.ts'
import { StartingScreen } from './scenes/StartingScreen.ts'
import { WorldSelectionMenu } from './scenes/WorldSelectionMenu.ts'
import { Level } from './scenes/Level.ts'
import { PauseMenu } from './scenes/PauseMenu.ts'
import { DeathScene } from './scenes/DeathScene.ts'
import { FinishedScreen } from './scenes/FinishedScreen.ts'
import { LoadingScreen } from './scenes/LoadingScreen.ts'
import { CreditsScene } from './scenes/CreditsScene.ts'

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
			gravity: { y: 2400 },
			debug: DEBUG,
		},
	},
	fps: {
		target: 30,
	},
	scene: [
		StartingScreen,
		WorldSelectionMenu,
		Level,
		PauseMenu,
		DeathScene,
		FinishedScreen,
		LoadingScreen,
		CreditsScene,
	],
	audio: {
		disableWebAudio: true,
	},
}

document.getElementsByTagName('body')[0].style.margin = 0 + 'px'

export default new Phaser.Game(config)

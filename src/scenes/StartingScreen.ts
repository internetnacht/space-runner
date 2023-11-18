import Player from '../components/Player.ts'
import { worlds } from '../constants.ts'
import MusicPlayer from '../components/MusicPlayer.ts'
import GameSettings from '../components/UserSettings.ts'
import { loadButtonAssets } from '../components/buttons/button-utils.ts'

class StartingScreen extends Phaser.Scene {
	constructor() {
		super({
			key: 'StartingScreen',
			active: true,
		})
	}

	preload() {
		Player.loadAssets(this)
		MusicPlayer.loadAssets(this)
		loadButtonAssets(this.load)
	}

	create() {
		worlds.forEach((world) => this.scene.add(world.getSceneKey(), world))

		this.scene.start('WorldSelectionMenu', {
			userSettings: GameSettings.default(),
		})
	}
}

export default StartingScreen

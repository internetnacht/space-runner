import Player from '../components/Player.ts'
import { worlds } from '../constants.ts'
import MusicPlayer from '../components/MusicPlayer.ts'

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
	}

	create() {
		worlds.forEach((world) => this.scene.add(world.getSceneKey(), world))

		this.scene.start('WorldSelectionMenu')
	}
}

export default StartingScreen

import Player from '../components/Player.ts'
import { GLOBAL_ASSET_KEYS, MEASURES, filePaths, worlds } from '../constants.ts'
import MusicPlayer from '../components/MusicPlayer.ts'
import GameSettings from '../components/GameSettings.ts'
import { loadButtonAssets } from '../components/buttons/button-utils.ts'
import { FancyClickButton } from '../components/buttons/FancyClickButton.ts'

class StartingScreen extends Phaser.Scene {
	private userSettings: GameSettings

	constructor() {
		super({
			key: 'StartingScreen',
			active: true,
		})
		this.userSettings = GameSettings.default()
	}

	preload() {
		this.load.image(
			GLOBAL_ASSET_KEYS.images.startingScreen.background,
			filePaths.images.startingScreen.background
		)
		Player.loadAssets(this)
		MusicPlayer.loadAssets(this)
		loadButtonAssets(this.load)
	}

	create() {
		worlds
			.filter((world) => this.scene.manager.keys[world.getSceneKey()] === undefined)
			.forEach((world) => this.scene.add(world.getSceneKey(), world))

		this.add
			.image(
				MEASURES.window.width / 2,
				MEASURES.window.height / 2,
				GLOBAL_ASSET_KEYS.images.startingScreen.background
			)
			.setOrigin()
			.setDepth(-1)
			.setScale(0.7)

		const musicPlayer = new MusicPlayer(this, this.userSettings)
		//musicPlayer.loop('audio-starting-screen')

		const fancy = new FancyClickButton(this, {
			x: MEASURES.window.width / 2,
			y: MEASURES.window.height * (2 / 3),
			label: 'Start',
			fixed: true,
			hoverFillColor: 0x00ff00,
			idleFillColor: 0x0000ff,
			clickCallback: () => {
				this.scene.start('WorldSelectionMenu', {
					userSettings: this.userSettings,
					musicPlayer,
				})
			},
		})
		fancy.center()
		fancy.display()
	}
}

export default StartingScreen

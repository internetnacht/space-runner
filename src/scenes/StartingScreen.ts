import { Player } from '../components/characters/Player.ts'
import { GLOBAL_ASSET_KEYS, MEASURES, filePaths, levels } from '../constants.ts'
import { MusicPlayer } from '../components/MusicPlayer.ts'
import { GameSettings } from '../components/GameSettings.ts'
import { loadButtonAssets } from '../components/buttons/button-utils.ts'
import { FancyClickButton } from '../components/buttons/FancyClickButton.ts'
import { MovingPlatform } from '../components/map-components/MovingPlatform.ts'
import { LoadingScreen } from './LoadingScreen.ts'
import { FirebaseTaskUnlocker } from '../auth/FirebaseTaskUnlocker.ts'

export class StartingScreen extends Phaser.Scene {
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
		MovingPlatform.loadAssets(this.load)
		loadButtonAssets(this.load)
		LoadingScreen.loadAssets(this)
	}

	create() {
		const loadingText = this.add.text(
			MEASURES.window.width / 2,
			MEASURES.window.height * (2 / 3),
			'lädt',
			{
				backgroundColor: '#000',
			}
		)
		loadingText.x = loadingText.x - loadingText.width / 2
		loadingText.y = loadingText.y - loadingText.height / 2
		let dotAmount = 0

		const loop = window.setInterval(() => {
			dotAmount++
			dotAmount %= 10
			loadingText.setText('lädt' + '.'.repeat(dotAmount))
		}, 1000)

		levels
			.filter((level) => this.scene.manager.keys[level.id] === undefined)
			.forEach((level) => this.scene.add(level.id, level))

		this.add
			.image(
				MEASURES.window.width / 2,
				MEASURES.window.height / 2,
				GLOBAL_ASSET_KEYS.images.startingScreen.background
			)
			.setOrigin()
			.setDepth(-1)
			.setDisplaySize(MEASURES.window.width, MEASURES.window.height)

		const musicplayer = new MusicPlayer(this, this.userSettings)
		//musicPlayer.loop('audio-starting-screen')
		const credits = new FancyClickButton(this, {
			x: 20,
			y: MEASURES.window.height - 80,
			label: 'Eigenlob',
			fixed: true,
			hoverFillColor: 0xc79600,
			idleFillColor: 0x242b27,
			clickCallback: () => {
				this.scene.launch('CreditsScene', {
					callingScene: 'StartingScreen',
				})

				this.scene.pause()
			},
		})
		credits.display()

		const fancy = new FancyClickButton(this, {
			x: MEASURES.window.width / 2,
			y: MEASURES.window.height * (2 / 3),
			label: 'Start',
			fixed: true,
			hoverFillColor: 0xc79600,
			idleFillColor: 0x242b27,
			clickCallback: () => {
				this.scene.start('WorldSelectionMenu', {
					userSettings: this.userSettings,
					taskUnlocker: FirebaseTaskUnlocker.instance,
				})
			},
		})
		fancy.center()

		const removeLoading = () => {
			loadingText.destroy()
			window.clearInterval(loop)
		}

		if (FirebaseTaskUnlocker.isSetup()) {
			removeLoading()
			fancy.display()
		} else {
			FirebaseTaskUnlocker.setup().then(() => {
				removeLoading()
				fancy.display()
			})
		}
		// removeLoading()
		// fancy.display()

		this.events.on('shutdown', () => {
			musicplayer.shutdown()
		})
	}
}

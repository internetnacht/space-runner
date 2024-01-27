import { MusicPlayer } from '../components/MusicPlayer.js'
import { DEBUG, GLOBAL_ASSET_KEYS, MEASURES, SCENE_ASSET_KEYS, filePaths } from '../constants.js'
import { InternalGameError } from '../errors/InternalGameError.js'

export class LoadingScreen extends Phaser.Scene {
	private targetScene?: string
	private initData?: object

	public static loadAssets(scene: Phaser.Scene) {
		scene.load.image('loadingscreen', filePaths.images.loadingscreen)
		scene.load.audio('loadingmusic', filePaths.audio['audio-loading-screen'])
	}

	public constructor() {
		super({
			key: 'LoadingScreen',
		})
	}

	public init(data: Record<string, unknown>) {
		if (typeof data.targetScene !== 'string') {
			throw new InternalGameError('target scene wasnt given to loading screen')
		}
		this.targetScene = data.targetScene

		delete data.targetScene
		this.initData = data
	}

	public create() {
		//@ts-ignore
		const music = new MusicPlayer(this, this.initData?.userSettings)
		music.loop('audio-loading-screen')

		this.add
			.image(0, 0, 'loadingscreen')
			.setOrigin(0)
			.setDisplaySize(MEASURES.window.width, MEASURES.window.height)

		const loadingBarWidth = 256
		const loadingBarHeight = 64
		const padding = 10

		const loadingBox = this.add.rectangle(
			MEASURES.window.width / 2,
			MEASURES.window.height / 2,
			loadingBarWidth + 2 * padding,
			loadingBarHeight + 2 * padding,
			0x0
		)
		const loadingBar = this.add
			.rectangle(
				MEASURES.window.width / 2 - loadingBarWidth / 2,
				MEASURES.window.height / 2 - loadingBarHeight / 2,
				0,
				loadingBarHeight,
				0x777
			)
			.setOrigin(0)

		if (this.targetScene === undefined) {
			throw new InternalGameError('target scene undefined')
		}

		this.load.image(SCENE_ASSET_KEYS.maps.tileset(this.targetScene), filePaths.sprites.sheet)
		this.load.image(GLOBAL_ASSET_KEYS.images.background, filePaths.images.background)
		this.load.json(
			SCENE_ASSET_KEYS.maps.master(this.targetScene),
			filePaths.maps.master(this.targetScene)
		)

		const duration = DEBUG ? 0 : 5000

		this.tweens.add({
			targets: loadingBar,
			duration,
			width: loadingBarWidth,
			onComplete: () => {
				this.load.on('complete', () => {
					music.shutdown()
					this.scene.start(this.targetScene, this.initData)
				})

				if (!this.load.isLoading()) {
					music.shutdown()
					this.scene.start(this.targetScene, this.initData)
				}
			},
		})

		this.load.start()

		const texts = [
			'Dieser Ladebildschirm hat btw. fast keinen praktischen Nutzen. Allerdings fanden wir, dass Ladebildschirme einfach unerlässlich sind, um in die richtige Stimmung zu kommen :)',
			'Über jedes Level verteilt gibt es Checkpoints. Solltest du von der Map fallen oder von etwas gefährlichem berührt werden, kommst du zurück zum Checkpoint und musst nicht von vorne anfangen.',
		]
		const text = this.add
			.text(
				MEASURES.window.width,
				loadingBox.y + loadingBox.height + 10,
				texts[Math.round(Math.random() * (texts.length - 1))],
				{
					wordWrap: {
						width: MEASURES.window.width * 0.6,
					},
				}
			)
			.setOrigin(0)
		text.x = MEASURES.window.width / 2 - text.width / 2
	}
}

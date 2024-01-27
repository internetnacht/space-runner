import { DEBUG, MEASURES, filePaths } from '../constants.js'
import { InternalGameError } from '../errors/InternalGameError.js'

export class LoadingScreen extends Phaser.Scene {
	private targetScene?: string
	private initData?: object

	public static loadAssets(scene: Phaser.Scene) {
		scene.load.image('loadingscreen', filePaths.images.loadingscreen)
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
		this.add
			.image(0, 0, 'loadingscreen')
			.setOrigin(0)
			.setDisplaySize(MEASURES.window.width, MEASURES.window.height)

		if (DEBUG) {
			this.scene.start(this.targetScene, this.initData)
		} else {
			this.time.delayedCall(2000, () => {
				this.scene.start(this.targetScene, this.initData)
			})
		}
	}
}

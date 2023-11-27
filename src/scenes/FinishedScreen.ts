import GameSettings from '../components/GameSettings'
import { FancyClickButton } from '../components/buttons/FancyClickButton'
import MusicPlayer from '../components/MusicPlayer'

export class FinishedScreen extends Phaser.Scene {
	private userSettings?: GameSettings
	private musicplayer?: MusicPlayer
	private callingScene?: string

	public constructor() {
		super({
			key: 'FinishedScreen',
		})
	}

	public init(data: Record<string, unknown>) {
		if (data.userSettings instanceof GameSettings) {
			this.userSettings = data.userSettings
		}

		if (data.musicplayer instanceof MusicPlayer) {
			this.musicplayer = data.musicplayer
		}

		if (typeof data.callingScene === 'string') {
			this.callingScene = data.callingScene
		}
	}

	public create() {
		this.scene.bringToTop()

		this.musicplayer?.stop('audio-background')
		this.musicplayer?.loop('audio-finished')

		const button = new FancyClickButton(this, {
			clickCallback: (() => {
				this.scene.start('WorldSelectionMenu', {
					userSettings: this.userSettings,
				})
				if (this.callingScene === undefined) {
					throw 'callingScene undefined in FinishedScreen'
				}
				this.scene.stop(this.callingScene)
			}).bind(this),
			fixed: true,
			hoverFillColor: 0x0000ff,
			idleFillColor: 0x00ff00,
			label: ':)',
			x: this.cameras.main.width / 2,
			y: this.cameras.main.width / 2,
		})
		button.center()
		button.display()
	}
}

import { List } from 'immutable'
import GameSettings from '../components/GameSettings'
import { FancyClickButton } from '../components/buttons/FancyClickButton'
import { MEASURES } from '../constants'
import { DeathCause } from '../global-types'
import MusicPlayer from '../components/MusicPlayer'

export class DeathScene extends Phaser.Scene {
	private userSettings?: GameSettings
	private callingScene?: string
	private deathCause?: DeathCause
	private musicplayer?: MusicPlayer

	public constructor() {
		super({
			key: 'DeathScene',
		})
	}

	public init(data: Record<string, unknown>) {
		if (data.userSettings instanceof GameSettings) {
			this.userSettings = data.userSettings
		}
		if (typeof data.callingScene === 'string') {
			this.callingScene = data.callingScene
		}
		if (data.deathCause !== undefined) {
			//todo unclean
			this.deathCause = data.deathCause as DeathCause
		}

		if (data.musicplayer instanceof MusicPlayer) {
			this.musicplayer = data.musicplayer
		}
	}

	public create() {
		this.scene.bringToTop()

		this.musicplayer?.stop('audio-background')
		this.musicplayer?.loop('audio-died')

		const text = new Phaser.GameObjects.Text(
			this,
			this.cameras.main.width / 2,
			this.cameras.main.height / 2,
			':(',
			{
				backgroundColor: 'black',
			}
		)

		text.addToDisplayList()

		const buttonsConfig = List([
			{
				label: 'restart',
				cb: (() => {
					if (this.callingScene === undefined) {
						throw 'callingScene undefined in DeathScene restart'
					}
					this.scene.stop(this.callingScene)
					this.scene.start(this.callingScene, {
						userSettings: this.userSettings,
					})
				}).bind(this),
			},
			{
				label: 'Zurück zur Levelauswahl',
				cb: (() => {
					this.scene.stop(this.callingScene)
					this.scene.start('WorldSelectionMenu', {
						userSettings: this.userSettings,
					})
				}).bind(this),
			},
		])

		const buttons = FancyClickButton.createVerticalButtonList({
			scene: this,
			x: this.cameras.main.width / 2,
			initialY: this.cameras.main.height / 4,
			margin: MEASURES.buttons.click.margin.normal,
			idleFillColor: 0x00ff00,
			hoverFillColor: 0x0000ff,
			buttonWidth: this.cameras.main.width / 3,
			buttons: buttonsConfig,
		})

		buttons.forEach((b) => b.display())
	}
}

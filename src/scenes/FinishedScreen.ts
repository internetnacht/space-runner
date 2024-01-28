import { GameSettings } from '../components/GameSettings'
import { FancyClickButton } from '../components/buttons/FancyClickButton'
import { MusicPlayer } from '../components/MusicPlayer'
import { TaskUnlocker } from '../auth/TaskUnlocker'
import { InternalGameError } from '../errors/InternalGameError'

export class FinishedScreen extends Phaser.Scene {
	private userSettings?: GameSettings
	private musicplayer?: MusicPlayer
	private callingScene?: string
	private taskUnlocker?: TaskUnlocker

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

		if (data.taskUnlocker !== undefined) {
			this.taskUnlocker = data.taskUnlocker as TaskUnlocker
		} else {
			throw new InternalGameError('FinishedScreen requires a task unlocker')
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
					taskUnlocker: this.taskUnlocker,
				})
				if (this.callingScene === undefined) {
					throw 'callingScene undefined in FinishedScreen'
				}
				this.scene.stop(this.callingScene)
			}).bind(this),
			fixed: true,
			hoverFillColor: 0x0000ff,
			idleFillColor: 0x00ff00,
			label: 'Level geschafft! :) Aufgabe wurde freigeschaltet',
			x: this.cameras.main.width / 2,
			y: this.cameras.main.height / 2,
		})
		button.center()
		button.display()
	}
}

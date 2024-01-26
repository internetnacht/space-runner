import { MusicPlayer } from '../components/MusicPlayer.ts'
import { GameSettings } from '../components/GameSettings.ts'
import { MEASURES, levels } from '../constants.ts'
import { FancyClickButton } from '../components/buttons/FancyClickButton.ts'
import { ToggleButton } from '../components/buttons/ToggleButton.ts'
import { TaskUnlocker } from '../auth/TaskUnlocker.ts'

export class WorldSelectionMenu extends Phaser.Scene {
	private userSettings?: GameSettings
	private musicPlayer?: MusicPlayer
	private taskUnlocker?: TaskUnlocker

	public constructor() {
		super({
			key: 'WorldSelectionMenu',
		})
	}

	public init(data: Record<string, unknown>) {
		if (data.userSettings instanceof GameSettings) {
			this.userSettings = data.userSettings
		} else {
			throw 'expected usersettings but got ' + data.userSettings
		}

		if (data.musicPlayer instanceof MusicPlayer) {
			this.musicPlayer = data.musicPlayer
		} else {
			this.musicPlayer = new MusicPlayer(this, this.userSettings)
			this.musicPlayer.loop('audio-starting-screen')
		}

		this.taskUnlocker = data.taskUnlocker as TaskUnlocker | undefined
	}

	public create() {
		const buttons = FancyClickButton.createVerticalButtonList({
			scene: this,
			x: MEASURES.buttons.click.margin.normal,
			initialY: 0,
			margin: MEASURES.buttons.fancy.click.margin,
			idleFillColor: 0x00ff00,
			hoverFillColor: 0x0000ff,
			buttonWidth: MEASURES.window.width - 2 * MEASURES.buttons.fancy.click.margin,
			buttons: levels
				.map((level) => level.id)
				.map((level) => {
					return {
						label: level,
						cb: () => {
							this.scene.start(level, {
								userSettings: this.userSettings?.clone(),
								taskUnlocker: this.taskUnlocker,
							})
						},
					}
				}),
		})

		buttons.forEach((button) => button.display())

		const musicButton = new ToggleButton(this, {
			initialState: this.userSettings?.musicIsOn ?? false,
			stateChangeCallback: (state) => {
				if (this.userSettings === undefined) {
					throw 'couldnt access user settings in WorldSelectionMenu'
				}
				this.userSettings.musicIsOn = state
			},
			x: 0,
			y: 0,
			fixed: true,
			label: 'Musik an/aus',
		})
		musicButton.toWindowBottom()
		musicButton.display()

		this.events.on('shutdown', () => {
			this.musicPlayer?.shutdown()
		})
	}
}

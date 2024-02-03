import { MusicPlayer } from '../components/MusicPlayer.ts'
import { GameSettings } from '../components/GameSettings.ts'
import { MEASURES, levels, taskUnlockers } from '../constants.ts'
import { FancyClickButton } from '../components/buttons/FancyClickButton.ts'
import { ToggleButton } from '../components/buttons/ToggleButton.ts'
import { TaskUnlocker } from '../auth/TaskUnlocker.ts'
import { InternalGameError } from '../errors/InternalGameError.ts'
import { ButtonList } from '../components/buttons/ButtonList.ts'

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

		if (data.taskUnlocker !== undefined) {
			this.taskUnlocker = data.taskUnlocker as TaskUnlocker
		} else {
			throw new InternalGameError('world selection requires task unlocker')
		}
	}

	public async create() {
		const buttons = FancyClickButton.createVerticalButtonList({
			scene: this,
			x: MEASURES.buttons.click.margin.normal,
			initialY: 0,
			margin: MEASURES.buttons.fancy.click.margin,
			idleFillColor: 0x242b27,
			hoverFillColor: 0xc79600,
			buttonWidth: MEASURES.window.width - 2 * MEASURES.buttons.fancy.click.margin,
			buttons: levels
				.map((level) => level.id)
				.map((level) => {
					return {
						//todo code below requires that this remains the level id
						label: level,
						cb: () => {
							this.scene.start('LoadingScreen', {
								targetScene: level,
								userSettings: this.userSettings?.clone(),
								taskUnlocker: this.taskUnlocker,
							})
						},
					}
				}),
		})

		const buttonList = new ButtonList(this, buttons)
		buttonList.display()

		buttonList.forEach((button) => {
			const levelId = button.label
			this.buildLevelLabel(levelId).then((newLabel) => {
				button.label = newLabel
			})
		})

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

	private async buildLevelLabel(levelKey: string): Promise<string> {
		if (this.taskUnlocker === undefined) {
			throw new InternalGameError('WorldSelectionMenu needs a task unlocker')
		}

		const tasks = taskUnlockers.filter((t) => t[0] === levelKey).map((t) => t[2])

		const unlockedTasks: number[] = []
		for (const t of tasks) {
			if (await this.taskUnlocker.isUnlocked(String(t))) {
				unlockedTasks.push(t)
			}
		}

		const totalTaskAmount = tasks.length
		const unlockedTaskAmount = unlockedTasks.length

		return `${levelKey} - ${unlockedTaskAmount}/${totalTaskAmount}`
	}
}

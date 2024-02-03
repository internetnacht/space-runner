import { List } from 'immutable'
import { GameSettings } from '../components/GameSettings.js'
import { MEASURES } from '../constants.js'
import { ToggleButton } from '../components/buttons/ToggleButton.js'
import { FancyClickButton } from '../components/buttons/FancyClickButton.js'
import { TaskUnlocker } from '../auth/TaskUnlocker.js'
import { InternalGameError } from '../errors/InternalGameError.js'
import { ButtonList } from '../components/buttons/ButtonList.js'
import { Player } from '../components/characters/Player.js'

export class PauseMenu extends Phaser.Scene {
	private callingScene?: string
	private userSettings?: GameSettings
	private taskUnlocker?: TaskUnlocker
	private player?: Player

	public constructor() {
		super({
			key: 'PauseMenu',
		})
	}

	public init(data: Record<string, unknown>) {
		if (typeof data.callingScene !== 'string') {
			throw 'no caller key given to PauseMenu'
		}
		this.callingScene = data.callingScene

		if (data.userSettings instanceof GameSettings) {
			this.userSettings = data.userSettings
		} else {
			throw 'expected userSettings but got undefined'
		}

		if (data.taskUnlocker !== undefined) {
			this.taskUnlocker = data.taskUnlocker as TaskUnlocker
		} else {
			throw new InternalGameError('pause menu requires task unlocker')
		}

		if (data.player instanceof Player) {
			this.player = data.player
		} else {
			throw new InternalGameError('pause menu requires player')
		}
	}

	public create() {
		this.scene.bringToTop()

		const buttonsConfig = List([
			{
				label: 'Fortfahren',
				cb: this.resumeCallingScene.bind(this),
			},
			{
				label: 'Welt neustarten',
				cb: this.restartCallingScene.bind(this),
			},
			{
				label: 'Zurück zum Checkpoint',
				cb: (() => {
					this.player?.kill(null)
					this.resumeCallingScene()
				}).bind(this),
			},
			{
				label: 'Zurück zur Levelauswahl',
				cb: (() => {
					this.backToScene('WorldSelectionMenu')
				}).bind(this),
			},
		])

		const buttons = FancyClickButton.createVerticalButtonList({
			scene: this,
			x: this.cameras.main.width / 2,
			initialY: this.cameras.main.height / 4,
			margin: MEASURES.buttons.click.margin.normal,
			idleFillColor: 0x242b27,
			hoverFillColor: 0xc79600,
			buttonWidth: this.cameras.main.width / 2,
			buttons: buttonsConfig,
		})

		buttons.forEach((button) => button.center())

		const buttonList = new ButtonList(this, buttons)
		buttonList.display()

		const toggleButton = new ToggleButton(this, {
			x: this.cameras.main.width / 2,
			y: buttons.last()?.bottom ?? this.cameras.main.height / 2,
			fixed: true,
			initialState: this.userSettings?.musicIsOn ?? false,
			label: 'Musik',
			stateChangeCallback: (toggleState) => {
				if (this.userSettings !== undefined) {
					this.userSettings.musicIsOn = toggleState
				} else {
					throw 'tried to set userSettings.musicIsOn but userSettings were undefined'
				}
			},
		})
		toggleButton.center()
		toggleButton.display()

		const keyboard = this.input.keyboard
		if (keyboard === null) {
			throw 'keyboard input plugin is null'
		}
		keyboard.on('keydown-ESC', this.resumeCallingScene.bind(this))
	}

	private resumeCallingScene() {
		if (this.callingScene === undefined) {
			throw 'pause menu has no calling scene set'
		}

		this.scene.resume(this.callingScene)
		this.scene.stop()
	}

	private restartCallingScene() {
		if (this.callingScene === undefined) {
			throw 'calling scene key is undefined'
		}
		this.scene.start(this.callingScene, {
			userSettings: this.userSettings?.clone(),
			taskUnlocker: this.taskUnlocker,
		})
	}

	private backToScene(sceneKey: string) {
		this.scene.start(sceneKey, {
			userSettings: this.userSettings?.clone(),
			taskUnlocker: this.taskUnlocker,
		})
		if (this.callingScene === undefined) {
			throw 'calling scene key is undefined'
		}
		this.scene.stop(this.callingScene)
	}
}

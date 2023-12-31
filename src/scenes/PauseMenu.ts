import { List } from 'immutable'
import { GameSettings } from '../components/GameSettings.js'
import { MEASURES } from '../constants.js'
import { ToggleButton } from '../components/buttons/ToggleButton.js'
import { FancyClickButton } from '../components/buttons/FancyClickButton.js'

export class PauseMenu extends Phaser.Scene {
	private callingScene?: string
	private userSettings?: GameSettings

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
				label: 'Zurück zur Levelauswahl',
				cb: (() => {
					this.backToScene('WorldSelectionMenu')
				}).bind(this),
			},
			{
				label: 'Zurück zum Startbildschirm',
				cb: (() => {
					this.backToScene('StartingScreen')
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
			buttonWidth: this.cameras.main.width / 2,
			buttons: buttonsConfig,
		})

		buttons.forEach((button) => {
			button.center()
			button.display()
		})

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

		this.scene.resume(this.callingScene, {
			userSettings: this.userSettings,
		})
		this.scene.stop()
	}

	private restartCallingScene() {
		if (this.callingScene === undefined) {
			throw 'calling scene key is undefined'
		}
		this.scene.start(this.callingScene, {
			userSettings: this.userSettings?.clone(),
		})
	}

	private backToScene(sceneKey: string) {
		this.scene.start(sceneKey, {
			userSettings: this.userSettings?.clone(),
		})
		if (this.callingScene === undefined) {
			throw 'calling scene key is undefined'
		}
		this.scene.stop(this.callingScene)
	}
}

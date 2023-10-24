import ClickButtonFactory from '../components/buttons/ClickButtonFactory.js'
import { List } from 'immutable'
import UserSettings from '../components/UserSettings.js'
import { LIST_BUTTON_MARGIN } from '../constants.js'
import ToggleButtonFactory from '../components/buttons/ToggleButtonFactory.js'

export default class PauseMenu extends Phaser.Scene {
	private callingScene?: string
	private userSettings?: UserSettings

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

		if (data.userSettings instanceof UserSettings) {
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
				cb: this.resumeCallingScene.bind(this)
			},
			{
				label: 'Welt neustarten',
				cb: this.restartCallingScene.bind(this)
			},
			{
				label: 'Zurück zur Levelauswahl',
				cb: this.backToWorldSelection.bind(this)
			}
		])

		const buttons = ClickButtonFactory.createListFromConfig({
			scene: this,
			x: this.cameras.main.width/2,
			initialY: this.cameras.main.height/2,
			margin: LIST_BUTTON_MARGIN,
			buttons: buttonsConfig
		})
		
		buttons.forEach(button => button.display())

		const toggleButtonFactory = new ToggleButtonFactory(
			this.cameras.main.width/2,
			buttons.last()?.getBottom() ?? this.cameras.main.height/2
		)
		toggleButtonFactory.setFixed(true)
		toggleButtonFactory.setInitialState(this.userSettings?.musicIsOn ?? false)
		toggleButtonFactory.setLabel('Musik')
		toggleButtonFactory.setCallback(toggleState => {
			if (this.userSettings !== undefined) {
				this.userSettings.musicIsOn = toggleState
			} else {
				throw 'tried to set userSettings.musicIsOn but userSettings were undefined'
			}
		})
		const toggleButton = toggleButtonFactory.build(this)
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
			userSettings: this.userSettings
		})
		this.scene.stop()
	}

	private restartCallingScene () {
		if (this.callingScene === undefined) {
			throw 'calling scene key is undefined'
		}
		this.scene.start(this.callingScene, {
			userSettings: this.userSettings
		})
	}

	private backToWorldSelection () {
		this.scene.start('WorldSelectionMenu', {
			userSettings: this.userSettings
		})
		if (this.callingScene === undefined) {
			throw 'calling scene key is undefined'
		}
		this.scene.stop(this.callingScene)
	}
}

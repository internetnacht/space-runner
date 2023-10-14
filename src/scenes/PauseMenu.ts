import Phaser from 'phaser'
import ButtonFactory from '../components/ButtonFactory.js'
import Button from '../components/Button.js'
import { List } from 'immutable'
import UserSettings from '../components/UserSettings.js'

export default class PauseMenu extends Phaser.Scene {
	private callingScene: string | null = null
	private userSettings?: UserSettings

	public constructor() {
		super({
			key: 'PauseMenu',
		})
	}

	public init(data: any) {
		if (data.callingScene === undefined || typeof data.callingScene !== 'string') {
			throw 'no caller key given to PauseMenu'
		}
		this.callingScene = data.callingScene

		if (data.userSettings !== undefined) {
			this.userSettings = data.userSettings
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
				cb: () => {
					if (this.callingScene === null) {
						throw 'calling scene key is null'
					}
					this.scene.start(this.callingScene, {
						userSettings: this.userSettings
					})
				}
			},
			{
				label: 'Zurück zur Levelauswahl',
				cb: () => {
					this.scene.start('WorldSelectionMenu', {
						userSettings: this.userSettings
					})
					if (this.callingScene === null) {
						throw 'calling scene key is null'
					}
					this.scene.stop(this.callingScene)
				}
			}
		])

		const buttons = buttonsConfig
			.map(config => {
				const bf = new ButtonFactory(this.cameras.main.width/2, 0)
				bf.setLabel(config.label)
				bf.setFixed()
				bf.setCallback(config.cb)
				return bf
			})
			.reduce((buttons, bf) => {
				const yOffset = buttons.last()?.getBottom() ?? this.cameras.main.height/2
				bf.setY(yOffset + 10)
				return buttons.push(bf.build(this))
			}, List<Button>())

		const keyboard = this.input.keyboard
		if (keyboard === null) {
			throw 'keyboard input plugin is null'
		}
		keyboard.on('keydown-ESC', this.resumeCallingScene.bind(this))
	}

	private resumeCallingScene() {
		if (this.callingScene === null) {
			throw 'pause menu has no calling scene set'
		}

		this.scene.resume(this.callingScene, {
			userSettings: this.userSettings
		})
		this.scene.stop()
	}
}

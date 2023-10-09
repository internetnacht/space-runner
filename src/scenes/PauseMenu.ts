import Phaser from 'phaser'
import ButtonFactory from '../components/ButtonFactory.js'
import Button from '../components/Button.js'
import { List } from 'immutable'

export default class PauseMenu extends Phaser.Scene {
	private callingScene: string | null = null

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
	}

	public create() {
		this.scene.bringToTop()

		const buttons: Button[] = []

		const bf1 = new ButtonFactory(this.cameras.main.width / 2, this.cameras.main.height / 2)
		bf1.setLabel('Fortfahren')
		bf1.setCallback(this.resumeCallingScene.bind(this))
		bf1.setFixed()
		const b1 = bf1.build(this)
		buttons.push(b1)

		const bf2 = new ButtonFactory(this.cameras.main.width / 2, b1.getBottom() + 10)
		bf2.setLabel('Welt neustarten')
		bf2.setCallback(() => {
			if (this.callingScene === null) {
				throw 'calling scene key is null'
			}
			this.scene.start(this.callingScene)
		})
		bf2.setFixed()
		const b2 = bf2.build(this)
		buttons.push(b2)

		const bf3 = new ButtonFactory(this.cameras.main.width / 2, b2.getBottom() + 10)
		bf3.setLabel('Zurück zur Levelauswahl')
		bf3.setCallback(() => {
			this.scene.start('WorldSelectionMenu')
			if (this.callingScene === null) {
				throw 'calling scene key is null'
			}
			this.scene.stop(this.callingScene)
		})
		bf3.setFixed()
		const b3 = bf3.build(this)
		buttons.push(b3)

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

		this.scene.resume(this.callingScene)
		this.scene.stop()
	}
}

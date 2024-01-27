import { MEASURES } from '../constants.js'
import { FancyClickButton } from '../components/buttons/FancyClickButton.js'

export class CreditsScene extends Phaser.Scene {
	private callingScene?: string

	public constructor() {
		super({
			key: 'CreditsScene',
		})
	}

	public init(data: Record<string, unknown>) {
		if (typeof data.callingScene !== 'string') {
			throw 'no caller key given to PauseMenu'
		}
		this.callingScene = data.callingScene
	}

	public create() {
		this.scene.bringToTop()

		const text = this.add
			.text(
				MEASURES.window.width / 2,
				MEASURES.window.height / 2,
				'Programmierung: dexter\nZeichnen: Hannah\nLeveldesign: dexter, Hannah',
				{ backgroundColor: '#000', padding: { x: 10, y: 10 } }
			)
			.setOrigin(0.5)

		const backButton = new FancyClickButton(this, {
			x: text.x,
			y: text.y + text.height,
			label: 'Fortfahren',
			fixed: true,
			hoverFillColor: 0x00ff00,
			idleFillColor: 0x0000ff,
			clickCallback: this.resumeCallingScene.bind(this),
		})

		backButton.center()
		backButton.display()

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
}

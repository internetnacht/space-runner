import Phaser from 'phaser'
import ClickButtonFactory from '../components/buttons/ClickButtonFactory.ts'
import { worlds } from '../constants.ts'
import ClickButton from '../components/buttons/ClickButton.ts'
import { List } from 'immutable'

const BUTTON_MARGIN = 10

export default class WorldSelectionMenu extends Phaser.Scene {
	public constructor() {
		super({
			key: 'WorldSelectionMenu',
		})
	}

	public create() {
		const buttons = worlds
			.map((world) => world.sceneKey)
			.map(this.prepareButtonFactory.bind(this))
			.reduce(this.setButtonYReducer.bind(this), List<ClickButton>())
		
		buttons.forEach(button => button.display())
	}

	private prepareButtonFactory(worldKey: string): ClickButtonFactory {
		const buttonFactory = new ClickButtonFactory(BUTTON_MARGIN, 0)
		buttonFactory.setCallback(() => {
			this.scene.start(worldKey)
		})

		buttonFactory.setLabel(worldKey)

		return buttonFactory
	}

	private setButtonYReducer(prevButtons: List<ClickButton>, buttonFactory: ClickButtonFactory): List<ClickButton> {
		const previous = prevButtons.last()
		const offset = previous?.getBottom() ?? 0
		const y = offset + BUTTON_MARGIN
		buttonFactory.setY(y)
		return prevButtons.push(buttonFactory.build(this))
	}
}

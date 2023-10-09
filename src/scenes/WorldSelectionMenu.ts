import Phaser from 'phaser'
import ButtonFactory from '../components/ButtonFactory.ts'
import { worlds } from '../constants.ts'
import Button from '../components/Button.ts'
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
			.reduce(this.setButtonYReducer.bind(this), List<Button>())
	}

	private prepareButtonFactory(worldKey: string): ButtonFactory {
		const buttonFactory = new ButtonFactory(BUTTON_MARGIN, 0)
		buttonFactory.setCallback(() => {
			this.scene.start(worldKey)
		})

		buttonFactory.setLabel(worldKey)

		return buttonFactory
	}

	private setButtonYReducer(prevButtons: List<Button>, buttonFactory: ButtonFactory): List<Button> {
		const previous = prevButtons.last()
		const offset = previous?.getBottom() ?? 0
		const y = offset + BUTTON_MARGIN
		buttonFactory.setY(y)
		return prevButtons.push(buttonFactory.build(this))
	}
}

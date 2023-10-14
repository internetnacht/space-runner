import ClickButtonFactory from '../components/buttons/ClickButtonFactory.ts'
import { LIST_BUTTON_MARGIN, worlds } from '../constants.ts'

export default class WorldSelectionMenu extends Phaser.Scene {
	public constructor() {
		super({
			key: 'WorldSelectionMenu',
		})
	}

	public create() {
		const buttons = ClickButtonFactory.createListFromConfig({
			scene: this,
			x: LIST_BUTTON_MARGIN,
			initialY: 0,
			margin: LIST_BUTTON_MARGIN,
			buttons: worlds
				.map(world => world.getSceneKey())
				.map(worldKey => {
					return {
						label: worldKey,
						cb: () => {
							this.scene.start(worldKey)
						}
					}
				})
		})
		
		buttons.forEach(button => button.display())
	}
}

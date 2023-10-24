import ClickButton from './ClickButton'
import ButtonFactory from './ButtonFactory'
import { List } from 'immutable'

export default class ClickButtonFactory extends ButtonFactory {
	private label = ''
	private clickCallback: (pointer: Phaser.Input.Pointer) => void = () => {}

	public constructor(x: number, y: number) {
		super(x, y)
	}

	public setLabel (label: string) {
		this.label = label
	}

	public setCallback(cb: (pointer: Phaser.Input.Pointer) => void) {
		this.clickCallback = cb
	}

	public build(scene: Phaser.Scene): ClickButton {
		const text = new Phaser.GameObjects.Text(scene, this.x, this.y, this.label, {})
			.setOrigin(0)
			.setPadding(8, 5)
			.setStyle({ backgroundColor: '#EEE', fill: '#111' })
			.setInteractive({ useHandCursor: true })
			.setScrollFactor(this.scrollFactor, this.scrollFactor)
			.on('pointerdown', this.clickCallback)
			.on('pointerover', () => text.setStyle({ fill: '#f39c12' }))
			.on('pointerout', () => text.setStyle({ fill: '#111' }))

		return new ClickButton(text)
	}

	public static createListFromConfig (listConfig: {
		scene: Phaser.Scene,
		x: number,
		initialY: number,
		margin: number
		buttons: List<{ label: string, cb: () => void }>
	}): List<ClickButton> {
		return listConfig.buttons
			.map(config => {
				const bf = new ClickButtonFactory(listConfig.x, 0)
				bf.setLabel(config.label)
				bf.setFixed(true)
				bf.setCallback(config.cb)
				return bf
			})
			.reduce((buttons, bf) => {
				const yOffset = buttons.last()?.getBottom() ?? listConfig.initialY
				bf.setY(yOffset + listConfig.margin)
				return buttons.push(bf.build(listConfig.scene))
			}, List<ClickButton>())
	}
}

import ClickButton from './ClickButton.js'
import ButtonFactory from './ButtonFactory.js'

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
		const scrollFactor = this.fixed ? 0 : 1

		const text = new Phaser.GameObjects.Text(scene, this.x, this.y, this.label, {})
			.setOrigin(0)
			.setPadding(8, 5)
			.setStyle({ backgroundColor: '#EEE', fill: '#111' })
			.setInteractive({ useHandCursor: true })
			.setScrollFactor(scrollFactor, scrollFactor)
			.on('pointerdown', this.clickCallback)
			.on('pointerover', () => text.setStyle({ fill: '#f39c12' }))
			.on('pointerout', () => text.setStyle({ fill: '#111' }))

		return new ClickButton(text)
	}
}

import { MEASURES } from '../../constants'
import Button from './Button'
import { computeScrollFactor } from './button-utils'
import { ButtonClickConfig } from './configs/ButtonClickConfig'
import { ButtonConfig } from './configs/ButtonConfig'
import { ButtonLabelConfig } from './configs/ButtonLabelConfig'
import { ButtonStyleConfig } from './configs/ButtonStyleConfig'

export class FancyClickButton implements Button {
	private readonly background: Phaser.GameObjects.Rectangle
	private readonly text: Phaser.GameObjects.Text

	public constructor(
		scene: Phaser.Scene,
		config: ButtonConfig & ButtonClickConfig & ButtonLabelConfig & ButtonStyleConfig
	) {
		const scrollFactor = computeScrollFactor(config.fixed)

		const text = new Phaser.GameObjects.Text(
			scene,
			config.x + MEASURES.buttons.fancy.click.padding.big,
			config.y + MEASURES.buttons.fancy.click.padding.big,
			config.label,
			{}
		)
			.setOrigin(0)
			.setScrollFactor(scrollFactor, scrollFactor)
			.setDepth(1)

		const background = new Phaser.GameObjects.Rectangle(
			scene,
			config.x,
			config.y,
			text.width + 2 * MEASURES.buttons.fancy.click.padding.big,
			text.height + 2 * MEASURES.buttons.fancy.click.padding.big,
			config.idleFillColor
		)
			.setInteractive({ useHandCursor: true })
			.on('pointerdown', config.clickCallback)
			.on('pointerover', () => background.setFillStyle(config.hoverFillColor))
			.on('pointerout', () => background.setFillStyle(config.idleFillColor))
			.setOrigin(0)
			.setDepth(0)

		this.text = text
		this.background = background
	}
	get x(): number {
		return this.background.x
	}
	set x(x: number) {
		const change = x - this.x
		this.background.setX(Math.floor(this.background.x + change))
		this.text.setX(Math.floor(this.text.x + change))
	}
	get y(): number {
		return this.background.y
	}
	set y(y: number) {
		const change = y - this.y
		this.background.setY(Math.floor(this.background.y + change))
		this.text.setY(Math.floor(this.text.y + change))
	}
	get width(): number {
		return this.background.width
	}
	get height(): number {
		return this.background.height
	}
	get bottom(): number {
		return this.x + this.height
	}
	destruct(): void {
		this.text.destroy()
		this.background.destroy()
	}
	display(): void {
		this.text.addToDisplayList()
		this.background.addToDisplayList()
	}
	center(): void {
		this.x = this.x - this.width / 2
		this.y = this.y - this.height / 2
	}
}

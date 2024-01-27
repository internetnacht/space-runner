import { List } from 'immutable'
import { MEASURES } from '../../constants'
import { Button } from './Button'
import { computeScrollFactor } from './button-utils'
import { ButtonClickConfig } from './configs/ButtonClickConfig'
import { ButtonConfig } from './configs/ButtonConfig'
import { ButtonLabelConfig } from './configs/ButtonLabelConfig'
import { ButtonSizeConfig } from './configs/ButtonSizeConfig'
import { ButtonStyleConfig } from './configs/ButtonStyleConfig'

export class FancyClickButton extends Button {
	private readonly background: Phaser.GameObjects.Rectangle
	private readonly text: Phaser.GameObjects.Text

	public constructor(
		scene: Phaser.Scene,
		config: ButtonConfig &
			ButtonClickConfig &
			ButtonLabelConfig &
			ButtonStyleConfig &
			Partial<ButtonSizeConfig>
	) {
		super(scene)
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
			Math.max(config.width ?? 0, text.width + 2 * MEASURES.buttons.fancy.click.padding.big),
			Math.max(
				config.height ?? 0,
				text.height + 2 * MEASURES.buttons.fancy.click.padding.big
			),
			config.idleFillColor
		)
			.on('pointerdown', config.clickCallback)
			.on('pointerover', () => background.setFillStyle(config.hoverFillColor))
			.on('pointerout', () => background.setFillStyle(config.idleFillColor))
			.setScrollFactor(scrollFactor, scrollFactor)
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
		return this.y + this.height
	}
	destruct(): void {
		this.text.destroy()
		this.background.destroy()
	}
	display(): void {
		this.text.addToDisplayList()
		this.background.addToDisplayList()
		this.background.setInteractive({ useHandCursor: true })
	}
	center(): void {
		this.x = this.x - this.width / 2
		this.y = this.y - this.height / 2
	}

	public static createVerticalButtonList(listConfig: {
		scene: Phaser.Scene
		x: number
		initialY: number
		margin: number
		idleFillColor: number
		hoverFillColor: number
		buttonWidth?: number
		buttonHeight?: number
		buttons: List<{ label: string; cb: () => void }>
	}): List<FancyClickButton> {
		return listConfig.buttons.reduce((buttons, buttonConfig) => {
			const yOffset = buttons.last()?.bottom ?? listConfig.initialY

			const nextButton = new FancyClickButton(listConfig.scene, {
				x: listConfig.x,
				y: yOffset + listConfig.margin,
				fixed: true,
				label: buttonConfig.label,
				idleFillColor: listConfig.idleFillColor,
				hoverFillColor: listConfig.hoverFillColor,
				width: listConfig.buttonWidth,
				height: listConfig.buttonHeight,
				clickCallback: buttonConfig.cb,
			})

			return buttons.push(nextButton)
		}, List<FancyClickButton>())
	}
}

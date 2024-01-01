import { List } from 'immutable'
import { Button } from './Button'
import { ButtonLabelConfig } from './configs/ButtonLabelConfig'
import { computeScrollFactor } from './button-utils'
import { ButtonClickConfig } from './configs/ButtonClickConfig'
import { ButtonConfig } from './configs/ButtonConfig'

export class ClickButton extends Button {
	private readonly text: Phaser.GameObjects.Text

	public constructor(
		scene: Phaser.Scene,
		config: ButtonConfig & ButtonClickConfig & ButtonLabelConfig
	) {
		super(scene)
		const scrollFactor = computeScrollFactor(config.fixed)

		const text = new Phaser.GameObjects.Text(scene, config.x, config.y, config.label, {})
			.setOrigin(0)
			.setPadding(8, 5)
			.setStyle({ backgroundColor: '#EEE', fill: '#111' })
			.setInteractive({ useHandCursor: true })
			.setScrollFactor(scrollFactor, scrollFactor)
			.on('pointerdown', config.clickCallback)
			.on('pointerover', () => text.setStyle({ fill: '#f39c12' }))
			.on('pointerout', () => text.setStyle({ fill: '#111' }))

		this.text = text
	}

	public get x(): number {
		return this.text.x
	}

	public set x(newX: number) {
		this.text.setX(Math.floor(newX))
	}

	public get y(): number {
		return this.text.y
	}

	public set y(newY: number) {
		this.text.setY(Math.floor(newY))
	}

	public get width(): number {
		return this.text.width
	}

	public get height(): number {
		return this.text.height
	}

	public get bottom(): number {
		return this.y + this.height
	}

	public destruct() {
		this.text.destroy()
	}

	public display() {
		this.text.addToDisplayList()
	}

	public static createVerticalButtonList(listConfig: {
		scene: Phaser.Scene
		x: number
		initialY: number
		margin: number
		buttons: List<{ label: string; cb: () => void }>
	}): List<ClickButton> {
		return listConfig.buttons.reduce((buttons, buttonConfig) => {
			const yOffset = buttons.last()?.bottom ?? listConfig.initialY

			const nextButton = new ClickButton(listConfig.scene, {
				x: listConfig.x,
				y: yOffset + listConfig.margin,
				fixed: true,
				label: buttonConfig.label,
				clickCallback: buttonConfig.cb,
			})

			return buttons.push(nextButton)
		}, List<ClickButton>())
	}

	public center() {
		this.x = this.x - this.width / 2
		this.y = this.y - this.height / 2
	}
}

import { List } from 'immutable'
import Button from './Button'
import { ButtonLabelConfig } from './configs/ButtonLabelConfig'
import { computeScrollFactor } from './button-utils'
import { ButtonClickConfig } from './configs/ButtonClickConfig'
import { ButtonConfig } from './configs/ButtonConfig'

export default class ClickButton implements Button {
	private readonly text: Phaser.GameObjects.Text

	public constructor(scene: Phaser.Scene, config: ButtonConfig & ButtonClickConfig & ButtonLabelConfig) {
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

	public getX (): number {
		return this.text.x
	}

	public getY (): number {
		return this.text.y
	}

	public getWidth (): number {
		return this.text.width
	}

	public getHeight (): number {
		return this.text.height
	}

	public getBottom (): number {
		return this.getY() + this.getHeight()
	}

	public destruct() {
		this.text.destroy()
	}

	public display () {
		this.text.addToDisplayList()
	}

	public static createVerticalButtonList (listConfig: {
		scene: Phaser.Scene,
		x: number,
		initialY: number,
		margin: number
		buttons: List<{ label: string, cb: () => void }>
	}): List<ClickButton> {
		return listConfig.buttons
			.reduce((buttons, buttonConfig) => {
				const yOffset = buttons.last()?.getBottom() ?? listConfig.initialY

				const nextButton = new ClickButton(listConfig.scene, {
					x: listConfig.x,
					y: yOffset + listConfig.margin,
					fixed: true,
					label: buttonConfig.label,
					clickCallback: buttonConfig.cb
				})

				return buttons.push(nextButton)
			}, List<ClickButton>())
	}
}
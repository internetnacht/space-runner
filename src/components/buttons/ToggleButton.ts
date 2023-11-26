import { GLOBAL_ASSET_KEYS, MEASURES } from '../../constants'
import Button from './Button'
import { ButtonLabelConfig } from './configs/ButtonLabelConfig'
import { ToggleButtonConfig } from './configs/ToggleButtonConfig'
import { computeScrollFactor } from './button-utils'

export default class ToggleButton extends Button {
	private readonly text: Phaser.GameObjects.Text
	private readonly togglerOn: Phaser.GameObjects.Image
	private readonly togglerOff: Phaser.GameObjects.Image
	private readonly overlay: Phaser.GameObjects.Rectangle
	private toggleState: boolean
	private stateChangeCallback: (toggleState: boolean) => void

	public constructor(
		scene: Phaser.Scene,
		config: ToggleButtonConfig & Partial<ButtonLabelConfig>
	) {
		super(scene)
		this.toggleState = config.initialState
		this.stateChangeCallback = config.stateChangeCallback

		const scrollFactor = computeScrollFactor(config.fixed)

		const togglerOn = new Phaser.GameObjects.Image(
			scene,
			config.x,
			config.y + MEASURES.buttons.toggle.margin.normal,
			GLOBAL_ASSET_KEYS.images.toggler.on
		)
			.setOrigin(0)
			.setScale(0.2)

		const togglerOff = new Phaser.GameObjects.Image(
			scene,
			config.x,
			config.y + MEASURES.buttons.toggle.margin.normal,
			GLOBAL_ASSET_KEYS.images.toggler.off
		)
			.setOrigin(0)
			.setScale(0.2)

		const togglerWidth = togglerOff.width * togglerOff.scale
		const togglerHeight = togglerOff.height * togglerOff.scale

		const text = new Phaser.GameObjects.Text(
			scene,
			config.x + togglerWidth + MEASURES.buttons.toggle.text.margin,
			config.y + MEASURES.buttons.toggle.margin.normal,
			config.label ?? '',
			{}
		)
			.setOrigin(0)
			.setScrollFactor(scrollFactor, scrollFactor)

		if (togglerHeight > text.height) {
			text.setY(togglerOn.y + (togglerHeight - text.height) / 2)
		} else {
			const textMiddleY = text.y - text.height / 2
			togglerOn.setY(textMiddleY - togglerHeight / 2)
			togglerOff.setY(textMiddleY - togglerHeight / 2)
		}

		const overlay = new Phaser.GameObjects.Rectangle(
			scene,
			config.x,
			config.y + MEASURES.buttons.toggle.margin.normal,
			togglerWidth + text.width,
			Math.max(togglerHeight, text.height),
			0x000,
			0
		)
			.setOrigin(0)
			.setScrollFactor(scrollFactor, scrollFactor)
			.setInteractive({ useHandCursor: true })

		this.text = text
		this.togglerOn = togglerOn
		this.togglerOff = togglerOff
		this.overlay = overlay

		this.addToggleCallback()
	}

	private addToggleCallback() {
		this.overlay.addListener('pointerdown', this.reactToClick, this)
	}

	private reactToClick() {
		this.toggleState = !this.toggleState
		this.updateDisplayToggler()
		this.stateChangeCallback(this.toggleState)
	}

	public get x(): number {
		return this.overlay.x
	}

	public set x(newX: number) {
		const change = newX - this.x
		this.overlay.setX(Math.floor(this.overlay.x + change))
		this.togglerOn.setX(Math.floor(this.togglerOn.x + change))
		this.togglerOff.setX(Math.floor(this.togglerOff.x + change))
		this.text.setX(Math.floor(this.text.x + change))
	}

	public get y(): number {
		return this.overlay.y
	}

	public set y(newY: number) {
		const change = newY - this.y
		this.overlay.setY(Math.floor(this.overlay.y + change))
		this.togglerOn.setY(Math.floor(this.togglerOn.y + change))
		this.togglerOff.setY(Math.floor(this.togglerOff.y + change))
		this.text.setY(Math.floor(this.text.y + change))
	}

	public get width(): number {
		return this.overlay.width
	}

	public get height(): number {
		return this.overlay.height
	}

	public get bottom(): number {
		return this.y + this.height
	}

	public destruct(): void {
		this.text.destroy()
		this.togglerOn.destroy()
		this.togglerOff.destroy()
		this.overlay.destroy()
	}

	public display(): void {
		this.text.addToDisplayList()
		this.updateDisplayToggler()
		this.overlay.addToDisplayList()
	}

	private updateDisplayToggler(): void {
		if (this.toggleState) {
			this.togglerOn.addToDisplayList()
			this.togglerOff.removeFromDisplayList()
		} else {
			this.togglerOff.addToDisplayList()
			this.togglerOn.removeFromDisplayList()
		}
	}

	public isOn(): boolean {
		return this.toggleState
	}

	public center() {
		this.x = this.x - this.width / 2
		this.y = this.y - this.height / 2
	}
}

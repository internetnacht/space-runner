import { MEASURES } from "../../constants";
import Button from "./Button";
import { ButtonLabelConfig } from "./configs/ButtonLabelConfig";
import { ToggleButtonConfig } from "./configs/ToggleButtonConfig";
import { computeScrollFactor } from "./button-utils";

export default class ToggleButton implements Button {
	private readonly text: Phaser.GameObjects.Text
	private readonly togglerOn: Phaser.GameObjects.Image
	private readonly togglerOff: Phaser.GameObjects.Image
	private readonly overlay: Phaser.GameObjects.Rectangle
	private toggleState: boolean
	private stateChangeCallback: (toggleState: boolean) => void

	public constructor (scene: Phaser.Scene, config: ToggleButtonConfig & Partial<ButtonLabelConfig>) {
		this.toggleState = config.initialState
		this.stateChangeCallback = config.stateChangeCallback

		const scrollFactor = computeScrollFactor(config.fixed)

		const togglerOn = new Phaser.GameObjects.Image(scene, config.x, config.y + MEASURES.buttons.toggle.margin.normal, 'toggle-button-on')
			.setOrigin(0)
			.setScale(0.2)

		const togglerOff = new Phaser.GameObjects.Image(scene, config.x, config.y + MEASURES.buttons.toggle.margin.normal, 'toggle-button-off')
			.setOrigin(0)
			.setScale(0.2)

			const togglerWidth = togglerOff.width*togglerOff.scale
			const togglerHeight = togglerOff.height*togglerOff.scale
	
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
				text.setY(togglerOn.y + (togglerHeight - text.height)/2)
			} else {
				const textMiddleY = text.y - text.height/2
				togglerOn.setY(textMiddleY - togglerHeight/2)
				togglerOff.setY(textMiddleY - togglerHeight/2)
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

	private addToggleCallback () {
		this.overlay.addListener('pointerdown', this.reactToClick, this)
	}

	private reactToClick () {
		this.toggleState = !this.toggleState
		this.updateDisplayToggler()
		this.stateChangeCallback(this.toggleState)
	}

	public getX (): number {
		return this.overlay.x
	}

	public getY(): number {
		return this.overlay.y
	}

	public getWidth(): number {
		return this.overlay.width
	}

	public getHeight(): number {
		return this.overlay.height
	}

	public getBottom (): number {
		return this.getY() + this.getHeight()
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

	private updateDisplayToggler (): void {
		if (this.toggleState) {
			this.togglerOn.addToDisplayList()
			this.togglerOff.removeFromDisplayList()
		} else {
			this.togglerOff.addToDisplayList()
			this.togglerOn.removeFromDisplayList()
		}
	}

	public isOn (): boolean {
		return this.toggleState
	}
}
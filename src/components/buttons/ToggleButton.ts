import Button from "./Button";

export default class ToggleButton implements Button {
	private readonly text: Phaser.GameObjects.Text
	private readonly togglerOn: Phaser.GameObjects.Image
	private readonly togglerOff: Phaser.GameObjects.Image
	private readonly overlay: Phaser.GameObjects.Rectangle
	private toggleState: boolean
	private callback: (toggleState: boolean) => void

	public constructor (
		text: Phaser.GameObjects.Text,
		togglerOn: Phaser.GameObjects.Image,
		togglerOff: Phaser.GameObjects.Image,
		overlay: Phaser.GameObjects.Rectangle,
		initialState: boolean,
		callback: (toggleState: boolean) => void
	) {
		this.text = text
		this.togglerOn = togglerOn
		this.togglerOff = togglerOff
		this.overlay = overlay
		this.toggleState = initialState
		this.callback = callback

		this.addToggleCallback()
	}

	private addToggleCallback () {
		this.overlay.addListener('pointerdown', this.reactToClick, this)
	}

	private reactToClick () {
		this.toggleState = !this.toggleState
		this.updateDisplayToggler()
		this.callback(this.toggleState)
	}

	public getBottom(): number {
		return this.overlay.y + this.overlay.height
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
import { filePaths } from "../../constants";
import Button from "./Button";
import ButtonFactory from "./ButtonFactory";
import ToggleButton from "./ToggleButton";

export default class ToggleButtonFactory extends ButtonFactory {
	private initialState = false
	private label = ''
	private callback: (toggleState: boolean) => void = () => {}
	
	public constructor (x: number, y: number) {
		super(x, y)
	}

	public static loadAssets(scene: Phaser.Scene): void {
		scene.load.image('toggle-button-on', filePaths.images.buttons.toggle.on)
		scene.load.image('toggle-button-off', filePaths.images.buttons.toggle.off)
	}

	public setLabel (label: string) {
		this.label = label
	}

	public setCallback (cb: (_: boolean) => void) {
		this.callback = cb
	}

	public build(scene: Phaser.Scene): Button {
		const togglerOn = new Phaser.GameObjects.Image(scene, this.x, this.y, 'toggle-button-on')
			.setOrigin(0)
			.setScale(0.2)

		const togglerOff = new Phaser.GameObjects.Image(scene, this.x, this.y, 'toggle-button-off')
			.setOrigin(0)
			.setScale(0.2)

		const togglerWidth = togglerOff.width*togglerOff.scale
		const togglerHeight = togglerOff.height*togglerOff.scale

		const text = new Phaser.GameObjects.Text(scene, this.x + togglerWidth, this.y, this.label, {})
			.setOrigin(0)
			.setScrollFactor(this.scrollFactor, this.scrollFactor)

		if (togglerHeight > text.height) {
			text.setY(togglerOn.y + togglerHeight/2)
		} else {
			const textMiddleY = text.y + text.y/2
			togglerOn.setY(textMiddleY)
			togglerOff.setY(textMiddleY)
		}

		const overlay = new Phaser.GameObjects.Rectangle(scene, this.x, this.y, togglerWidth + text.width, Math.max(togglerHeight, text.height), 0x000, 0)
			.setOrigin(0)
			.setScrollFactor(this.scrollFactor, this.scrollFactor)
			.setInteractive({ useHandCursor: true })

		console.log(
			`togglerOn: x=${togglerOn.x}, y=${togglerOn.y}
			togglerOff: x=${togglerOff.x}, y=${togglerOff.y}
			text: x=${text.x}, y=${text.y}
			overlay: x=${overlay.x}, y=${overlay.y}`)

		return new ToggleButton(text, togglerOn, togglerOff, overlay, this.initialState, this.callback)
	}

	public setInitialState (state: boolean) {
		this.initialState = state
	}
}
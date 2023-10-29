import { MEASURES, filePaths } from "../../constants";
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
		/** todo
		 * add music player reaction to userSettings.musicIsOn
		 */
		const togglerOn = new Phaser.GameObjects.Image(scene, this.x, this.y + MEASURES.buttons.toggle.margin.normal, 'toggle-button-on')
			.setOrigin(0)
			.setScale(0.2)

		const togglerOff = new Phaser.GameObjects.Image(scene, this.x, this.y + MEASURES.buttons.toggle.margin.normal, 'toggle-button-off')
			.setOrigin(0)
			.setScale(0.2)

		const togglerWidth = togglerOff.width*togglerOff.scale
		const togglerHeight = togglerOff.height*togglerOff.scale

		const text = new Phaser.GameObjects.Text(
			scene,
			this.x + togglerWidth + MEASURES.buttons.toggle.text.margin,
			this.y + MEASURES.buttons.toggle.margin.normal,
			this.label,
			{}
		)
			.setOrigin(0)
			.setScrollFactor(this.scrollFactor, this.scrollFactor)

		if (togglerHeight > text.height) {
			text.setY(togglerOn.y + (togglerHeight - text.height)/2)
		} else {
			const textMiddleY = text.y - text.height/2
			togglerOn.setY(textMiddleY - togglerHeight/2)
			togglerOff.setY(textMiddleY - togglerHeight/2)
		}

		const overlay = new Phaser.GameObjects.Rectangle(
			scene,
			this.x,
			this.y + MEASURES.buttons.toggle.margin.normal,
			togglerWidth + text.width,
			Math.max(togglerHeight, text.height),
			0x000,
			0
		)
			.setOrigin(0)
			.setScrollFactor(this.scrollFactor, this.scrollFactor)
			.setInteractive({ useHandCursor: true })

		return new ToggleButton(text, togglerOn, togglerOff, overlay, this.initialState, this.callback)
	}

	public setInitialState (state: boolean) {
		this.initialState = state
	}
}
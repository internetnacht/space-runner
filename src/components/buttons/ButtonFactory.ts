import Button from "./Button"

export default abstract class ButtonFactory {
	protected x: number
	protected y: number
	protected fixed = false

	protected constructor (x: number, y: number) {
		this.x = x
		this.y = y
	}

	public abstract build (scene: Phaser.Scene): Button

	public setX (x: number) {
		this.x = x
	}

	public setY (y: number) {
		this.y = y
	}

	public setFixed(fixed: boolean) {
		this.fixed = fixed
	}
}
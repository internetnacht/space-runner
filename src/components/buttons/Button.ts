export default abstract class Button {
	protected scene: Phaser.Scene

	protected constructor(scene: Phaser.Scene) {
		this.scene = scene
	}

	public abstract get x(): number
	public abstract set x(newX: number)
	public abstract get y(): number
	public abstract set y(newY: number)
	public abstract get width(): number
	public abstract get height(): number
	public abstract get bottom(): number
	public abstract destruct(): void
	public abstract display(): void
	public abstract center(): void

	public toWindowBottom() {
		this.y = this.scene.cameras.main.height - this.height
	}

	public toWindowRight() {
		this.x = this.scene.cameras.main.width - this.width
	}
}

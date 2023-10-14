import Button from './Button'

export default class ClickButton implements Button {
	private readonly text: Phaser.GameObjects.Text

	public constructor(text: Phaser.GameObjects.Text) {
		this.text = text
	}

	public getBottom(): number {
		return this.text.y + this.text.height
	}

	public destruct() {
		this.text.destroy()
	}

	public display () {
		this.text.addToDisplayList()
	}
}
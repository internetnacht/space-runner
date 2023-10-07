import Phaser from 'phaser'

export default class Button {
    private readonly text: Phaser.GameObjects.Text;

    public constructor (text: Phaser.GameObjects.Text) {
        this.text = text
    }

    public getBottom (): number {
        return this.text.y + this.text.height
    }

    public destruct () {
        this.text.destroy()
    }
}
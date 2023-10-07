import Phaser from 'phaser'

export default class Button {
    private readonly text: Phaser.GameObjects.Text;

    public constructor (text: Phaser.GameObjects.Text) {
        this.text = text
    }

    public getHeight (): number {
        return this.text.height
    }

    public destruct () {
        this.text.destroy()
    }
}
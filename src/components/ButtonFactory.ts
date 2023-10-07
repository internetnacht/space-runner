import Phaser from 'phaser'
import Button from "./Button.ts";

export default class ButtonFactory {
    private x: number;
    private y: number;
    private fixed = false
    private label = ''
    private callback: (pointer: Phaser.Input.Pointer) => void = () => {}

    public constructor (x: number, y: number) {
        this.x = x
        this.y = y
    }

    public setFixed () {
        this.fixed = true
    }

    public setLabel (label: string) {
        this.label = label
    }

    public setCallback (cb: (pointer: Phaser.Input.Pointer) => void) {
        this.callback = cb
    }

    public build (scene: Phaser.Scene): Button {
        const scrollFactor = this.fixed ? 0 : 1

        const button = scene.add.text(this.x, this.y, this.label)
            .setOrigin(0)
            .setPadding(8, 5)
            .setStyle({ backgroundColor: '#EEE', fill: '#111' })
            .setInteractive({ useHandCursor: true })
            .setScrollFactor(scrollFactor, scrollFactor)
            .on('pointerdown', this.callback)
            .on('pointerover', () => button.setStyle({ fill: '#f39c12' }))
            .on('pointerout', () => button.setStyle({ fill: '#111' }));

        return new Button(button)
    }
}
import Phaser from 'phaser'
import ButtonFactory from "../components/ButtonFactory.ts";

export default class WorldSelectionMenu extends Phaser.Scene {

    public constructor () {
        super({
            key: 'WorldSelectionMenu'
        })
    }
    public create () {
        const levels = ['Map', 'Map5']
        const buttons = []
        const margin = 10
        let x_offset = margin
        let y_offset = margin

        for (const level of levels) {
            const buttonFactory = new ButtonFactory(x_offset, y_offset)
            buttonFactory.setCallback(() => {
                this.scene.start(level)
            })
            buttonFactory.setLabel(level)
            const button = buttonFactory.build(this)

            y_offset += button.getHeight() + margin

            buttons.push(button)
        }
    }

    private addRectangle (x: number, y: number, width: number, height: number, fillColor: number): Phaser.GameObjects.Rectangle {
        return this.add.rectangle(x, y, width, height, fillColor)
    }
}
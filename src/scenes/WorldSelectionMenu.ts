import Phaser from 'phaser'
import ButtonFactory from "../components/ButtonFactory.ts";
import {worlds} from "../constants.ts";
import Button from "../components/Button.ts";

const BUTTON_MARGIN = 10

export default class WorldSelectionMenu extends Phaser.Scene {
    public constructor () {
        super({
            key: 'WorldSelectionMenu'
        })
    }

    public create () {
        const buttonFactories = worlds
            .map(world => world.sceneKey)
            .map(worldKey => {
                const buttonFactory = new ButtonFactory(BUTTON_MARGIN, 0)
                buttonFactory.setCallback(() => {
                    this.scene.start(worldKey)
                    this.scene.stop()
                })

                buttonFactory.setLabel(worldKey)

                return buttonFactory
            })

        //no idea how to do this in functional style
        let y_offset = BUTTON_MARGIN
        const buttons: Button[] = []
        for (const buttonFactory of buttonFactories) {
            buttonFactory.setY(y_offset)
            const button = buttonFactory.build(this)
            y_offset += button.getHeight() + BUTTON_MARGIN
            buttons.push(button)
        }
    }
}
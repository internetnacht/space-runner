import { Point } from '../Point'
import { GameCharacter } from './GameCharacter'
import { WigglingController } from './WigglingController'

export default class WigglingNPC extends GameCharacter {
	public constructor(scene: Phaser.Scene, spawnPosition: Point, lethal = false) {
		super(
			scene,
			spawnPosition,
			'dude',
			() => {
				this.teleportTo(spawnPosition)
			},
			() => {
				this.teleportTo(spawnPosition)
			},
			lethal
		)

		this.setController(new WigglingController(this.sprite, this))
	}
}

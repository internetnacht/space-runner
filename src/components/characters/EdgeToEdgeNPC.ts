import { PixelPoint } from '../../utils/points/PixelPoint'
import { EdgeToEdgeController } from './EdgeToEdgeController'
import { GameCharacter } from './GameCharacter'

export class EdgeToEdgeNPC extends GameCharacter {
	public constructor(scene: Phaser.Scene, spawnPosition: PixelPoint, lethal = false) {
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

		this.setController(new EdgeToEdgeController(this.sprite, this))
	}
}

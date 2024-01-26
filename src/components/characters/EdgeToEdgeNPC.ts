import { PixelPoint } from '../../utils/points/PixelPoint'
import { TiledMap } from '../chunks/TiledMap'
import { EdgeToEdgeController } from './EdgeToEdgeController'
import { GameCharacter } from './GameCharacter'

export class EdgeToEdgeNPC extends GameCharacter {
	public constructor(
		scene: Phaser.Scene,
		map: TiledMap,
		spawnPosition: PixelPoint,
		lethal = false
	) {
		super(
			scene,
			map,
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

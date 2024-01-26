import { PixelPoint } from '../../utils/points/PixelPoint'
import { Controls } from '../controls/Controls'
import { TiledMap } from '../chunks/TiledMap'
import { EdgeToEdgeController } from './EdgeToEdgeController'
import { GameCharacter } from './GameCharacter'

export class EdgeToEdgeNPC extends GameCharacter {
	public constructor(
		scene: Phaser.Scene,
		map: TiledMap,
		controls: Controls,
		spawnPosition: PixelPoint,
		lethal = false
	) {
		super(
			scene,
			map,
			controls,
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

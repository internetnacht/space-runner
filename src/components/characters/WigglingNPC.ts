import { PixelPoint } from '../../utils/points/PixelPoint'
import { TiledMap } from '../chunks/TiledMap'
import { GameCharacter } from './GameCharacter'
import { WigglingController } from './WigglingController'

export class WigglingNPC extends GameCharacter {
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

		this.setController(new WigglingController(this.sprite, this))
	}
}

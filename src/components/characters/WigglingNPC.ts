import { PixelPoint } from '../../utils/points/PixelPoint'
import { Controls } from '../controls/Controls'
import { TiledMap } from '../chunks/TiledMap'
import { GameCharacter } from './GameCharacter'
import { WigglingController } from './WigglingController'

export class WigglingNPC extends GameCharacter {
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

		this.setController(new WigglingController(this.sprite, this))
	}
}

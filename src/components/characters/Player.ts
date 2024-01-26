import { CollisionCause } from '../../global-types'
import { PixelPoint } from '../../utils/points/PixelPoint'
import { Controls } from '../controls/Controls'
import { TiledMap } from '../chunks/TiledMap'
import { GameCharacter } from './GameCharacter'
import { PlayerController } from './PlayerController'

export class Player extends GameCharacter {
	public constructor(
		scene: Phaser.Scene,
		map: TiledMap,
		controls: Controls,
		finishCallback: (cause: CollisionCause) => void,
		spawnPosition?: PixelPoint
	) {
		super(
			scene,
			map,
			controls,
			spawnPosition,
			'dude',
			(_: any) => {
				this.teleportTo(this.activeCheckpoint.toPixelPoint())
			},
			finishCallback
		)

		this.setController(new PlayerController(this.sprite, this))
	}
}

import { CollisionCause } from '../../global-types'
import { PixelPoint } from '../../utils/points/PixelPoint'
import { GameCharacter } from './GameCharacter'
import { PlayerController } from './PlayerController'

export class Player extends GameCharacter {
	public constructor(
		scene: Phaser.Scene,
		finishCallback: (cause: CollisionCause) => void,
		spawnPosition?: PixelPoint
	) {
		super(
			scene,
			spawnPosition,
			'dude',
			(_) => {
				this.teleportTo(this.activeCheckpoint.toPixelPoint())
			},
			finishCallback
		)

		this.setController(new PlayerController(this.sprite, this))
	}
}

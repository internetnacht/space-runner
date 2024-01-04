import { CollisionCause } from '../../global-types'
import { PixelPoint } from '../../utils/points/PixelPoint'
import { GameCharacter } from './GameCharacter'
import { PlayerController } from './PlayerController'

export class Player extends GameCharacter {
	public constructor(
		scene: Phaser.Scene,
		deathCallback: (cause: CollisionCause) => void,
		finishCallback: (cause: CollisionCause) => void,
		spawnPosition?: PixelPoint
	) {
		super(scene, spawnPosition, 'dude', deathCallback, finishCallback)

		this.setController(new PlayerController(this.sprite, this))
	}
}

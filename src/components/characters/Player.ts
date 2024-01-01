import { CollisionCause } from '../../global-types'
import { GameCharacter } from './GameCharacter'
import { PlayerController } from './PlayerController'

export default class Player extends GameCharacter {
	public constructor(
		scene: Phaser.Scene,
		deathCallback: (cause: CollisionCause) => void,
		finishCallback: (cause: CollisionCause) => void,
		spawnPosition?: { x: number; y: number }
	) {
		super(scene, spawnPosition, 'dude', deathCallback, finishCallback)

		this.setController(new PlayerController(this.sprite, this))
	}
}

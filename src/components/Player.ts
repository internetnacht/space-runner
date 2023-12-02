import { DEBUG, SCENE_ASSET_KEYS } from '../constants'
import { CollisionCause } from '../global-types'
import { GameCharacter } from './GameCharacter'

export default class Player extends GameCharacter {
	public constructor(
		scene: Phaser.Scene,
		deathCallback: (cause: CollisionCause) => void,
		finishCallback: (cause: CollisionCause) => void,
		spawnPosition?: { x: number; y: number }
	) {
		super(scene, spawnPosition, 'dude', deathCallback, finishCallback)

		this.setController({
			act: this.move.bind(this),
		})
	}

	private move(scene: Phaser.Scene) {
		const keyboard = scene.input.keyboard
		if (keyboard === null) {
			throw 'keyboard plugin is null'
		}
		const cursors = keyboard.createCursorKeys()

		if (cursors.left.isDown) {
			this.moveSideWays(-160, 'left')
		} else if (cursors.right.isDown) {
			this.moveSideWays(160, 'right')
		} else {
			this.moveSideWays(0, 'turn')
		}

		if (cursors.up.isDown) {
			if (DEBUG || this.sprite.body.onFloor()) {
				this.sprite.setVelocityY(-350)
			} else {
				const currentVelocity = this.sprite.body.velocity.y
				if (currentVelocity < 0) {
					this.sprite.setVelocityY(currentVelocity - 6)
				}
			}
		}
	}

	private moveSideWays(velocity: number, direction: 'left' | 'right' | 'turn') {
		this.sprite.setVelocityX(velocity)

		if (direction === 'turn') {
			this.sprite.anims.play(SCENE_ASSET_KEYS.animations.character.moving.turn(this.type))
			return
		}

		const animationKeySelector = (() => {
			if (this.sprite.body.onFloor()) {
				return SCENE_ASSET_KEYS.animations.character.moving
			} else {
				return SCENE_ASSET_KEYS.animations.character.moving.jumping
			}
		})()

		this.sprite.anims.play(animationKeySelector[direction](this.type), true)
	}
}

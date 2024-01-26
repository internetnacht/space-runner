import { DEBUG, SCENE_ASSET_KEYS } from '../../constants'
import { Controls } from '../controls/Controls'
import { GameCharacter } from './GameCharacter'
import { GameCharacterController } from './GameCharacterController'

export class PlayerController implements GameCharacterController {
	private readonly body: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody
	private readonly character: GameCharacter
	private down = false

	public constructor(
		body: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody,
		character: GameCharacter
	) {
		this.body = body
		this.character = character
	}

	public act(scene: Phaser.Scene, controls: Controls) {
		this.move(scene, controls)
	}

	public movesDown(): boolean {
		return this.down
	}

	private move(_: Phaser.Scene, controls: Controls) {
		const jumpSpeed = 700
		const jumpPush = 7

		const horizontalSpeed = 300

		const speed = DEBUG ? horizontalSpeed * 2 : horizontalSpeed

		this.down = controls.bottomDown()

		if (controls.leftDown()) {
			this.moveSideWays(-speed, 'left')
		} else if (controls.rightDown()) {
			this.moveSideWays(speed, 'right')
		} else {
			this.moveSideWays(0, 'turn')
		}

		if (controls.upDown()) {
			if (DEBUG || this.body.body.onFloor()) {
				this.body.setVelocityY(-jumpSpeed)
			} else {
				const currentVelocity = this.body.body.velocity.y
				if (currentVelocity < 0) {
					this.body.setVelocityY(currentVelocity - jumpPush)
				}
			}
		}
	}

	private moveSideWays(velocity: number, direction: 'left' | 'right' | 'turn') {
		this.body.setVelocityX(velocity)

		if (direction === 'turn') {
			this.body.anims.play(
				SCENE_ASSET_KEYS.animations.character.moving.turn(this.character.type)
			)
			return
		}

		const animationKeySelector = (() => {
			if (this.body.body.onFloor()) {
				return SCENE_ASSET_KEYS.animations.character.moving
			} else {
				return SCENE_ASSET_KEYS.animations.character.moving.jumping
			}
		})()

		this.body.anims.play(animationKeySelector[direction](this.character.type), true)
	}
}

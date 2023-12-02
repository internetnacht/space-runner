import { DEBUG, SCENE_ASSET_KEYS } from '../../constants'
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

	public act(scene: Phaser.Scene) {
		this.move(scene)
	}

	public movesDown(): boolean {
		return this.down
	}

	private move(scene: Phaser.Scene) {
		const keyboard = scene.input.keyboard
		if (keyboard === null) {
			throw 'keyboard plugin is null'
		}
		const cursors = keyboard.createCursorKeys()
		const speed = DEBUG ? 160 * 4 : 160

		this.down = cursors.down.isDown

		if (cursors.left.isDown) {
			this.moveSideWays(-speed, 'left')
		} else if (cursors.right.isDown) {
			this.moveSideWays(speed, 'right')
		} else {
			this.moveSideWays(0, 'turn')
		}

		if (cursors.up.isDown) {
			if (DEBUG || this.body.body.onFloor()) {
				this.body.setVelocityY(-350)
			} else {
				const currentVelocity = this.body.body.velocity.y
				if (currentVelocity < 0) {
					this.body.setVelocityY(currentVelocity - 6)
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

import { SCENE_ASSET_KEYS } from '../../constants'
import { GameCharacter } from './GameCharacter'
import { GameCharacterController } from './GameCharacterController'

export class WigglingController implements GameCharacterController {
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

	public act(_: Phaser.Scene) {
		this.move()
	}

	public movesDown(): boolean {
		return this.down
	}

	private move() {
		const side = Math.random()
		const vertical = Math.random()
		const speed = 160

		if (side < 0.5) {
			this.moveSideWays(-speed, 'left')
		} else if (side >= 0.5) {
			this.moveSideWays(speed, 'right')
		}

		if (vertical < 0.8) {
			if (this.body.body.onFloor()) {
				this.body.setVelocityY(-350)
			}
			this.down = false
		} else {
			this.down = true
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

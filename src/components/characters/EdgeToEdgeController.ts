import { SCENE_ASSET_KEYS } from '../../constants'
import { getLayerBoolProperty } from '../../utils'
import { Point } from '../Point'
import { Chunk } from '../chunks/Chunk'
import { GameCharacter } from './GameCharacter'
import { GameCharacterController } from './GameCharacterController'

export class EdgeToEdgeController implements GameCharacterController {
	private direction = true
	private readonly body: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody
	private readonly character: GameCharacter

	public constructor(
		body: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody,
		character: GameCharacter
	) {
		this.body = body
		this.character = character
	}

	public act(_: Phaser.Scene, map: Chunk) {
		if (this.hasSpace(map)) {
			this.move()
		} else {
			this.direction = this.changeDirection(this.direction)
			this.move()
		}
	}

	private hasSpace(map: Chunk): boolean {
		const bodyPosition = new Point(this.body.x, this.body.y).toTileCoordinates()

		const destination = (() => {
			if (this.direction) {
				return bodyPosition.toLeft()
			} else {
				return bodyPosition.toRight()
			}
		})()

		const destinationTiles = map.getTilesAt(destination)

		return (
			destinationTiles
				.map((tile) => tile.layer)
				.find((layer) => getLayerBoolProperty(layer, 'collide')) !== undefined
		)
	}

	private move() {
		this.body.setVelocityX(230 * (this.direction ? -1 : 1))

		this.body.anims.play(
			SCENE_ASSET_KEYS.animations.character.moving[this.direction ? 'left' : 'right'](
				this.character.type
			),
			true
		)
	}

	private changeDirection(direction: boolean): boolean {
		return !direction
	}

	public movesDown(): boolean {
		return false
	}
}

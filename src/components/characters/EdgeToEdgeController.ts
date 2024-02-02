import { SCENE_ASSET_KEYS } from '../../constants'
import { PixelPoint } from '../../utils/points/PixelPoint'
import { TiledMap } from '../chunks/TiledMap'
import { GameCharacter } from './GameCharacter'
import { GameCharacterController } from './GameCharacterController'
import { Controls } from '../controls/Controls'

export class EdgeToEdgeController implements GameCharacterController {
	private direction = true
	private readonly body: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody
	private readonly character: GameCharacter

	public constructor(
		body: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody,
		character: GameCharacter
	) {
		this.body = body.setOrigin(0)
		this.character = character
	}

	public act(_: Phaser.Scene, __: Controls, map?: TiledMap) {
		if (map === undefined) {
			return
		}
		if (this.character.isFrozen()) {
			return
		}

		if (this.hasSpace(map)) {
			this.move()
		} else {
			this.direction = this.changeDirection(this.direction)
			this.move()
		}
	}

	private hasSpace(map: TiledMap): boolean {
		const bodyPosition = new PixelPoint(this.body.x, this.body.y)
		const bodyTilesPosition = bodyPosition.toTilePoint()

		//todo this is highly dependant on the character size
		const destinationHeadLevel = (() => {
			if (this.direction) {
				return bodyTilesPosition.toLeft()
			} else {
				return bodyTilesPosition.toRight().toRight()
			}
		})()

		const a = !map.isSolidAt(destinationHeadLevel)
		const b = !map.isSolidAt(destinationHeadLevel.toBottom())
		const c = !map.isSolidAt(destinationHeadLevel.toBottom().toBottom())
		const d = map.isSolidAt(destinationHeadLevel.toBottom().toBottom().toBottom())

		return a && b && c && d
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

import { SCENE_ASSET_KEYS } from '../../constants'
import { getLayerBoolProperty } from '../../utils/utils'
import { PixelPoint } from '../../utils/points/PixelPoint'
import { TiledMap } from '../chunks/TiledMap'
import { GameCharacter } from './GameCharacter'
import { GameCharacterController } from './GameCharacterController'
import { TilePoint } from '../../utils/points/TilePoint'
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

		if (this.hasSpace(map)) {
			console.log('has space')
			this.move()
		} else {
			console.log('has no space')
			this.direction = this.changeDirection(this.direction)
			this.move()
		}
	}

	private hasSpace(map: TiledMap): boolean {
		const bodyPosition = new PixelPoint(this.body.x, this.body.y)
		const bodyTilesPosition = bodyPosition.toTilePoint()

		const destinationHeadLevel = (() => {
			if (this.direction) {
				return bodyTilesPosition.toLeft()
			} else {
				return bodyTilesPosition.toRight()
			}
		})()

		const a = !this.tilePositionIsSolid(map, destinationHeadLevel)
		const b = !this.tilePositionIsSolid(map, destinationHeadLevel.toBottom())
		const c = this.tilePositionIsSolid(map, destinationHeadLevel.toBottom().toBottom())

		return a && b && c
	}

	private tilePositionIsSolid(map: TiledMap, position: TilePoint): boolean {
		const destinationTiles = map.getTilesAt(position)

		return (
			destinationTiles
				.map((tile) => tile.layer)
				.find((layer) => !getLayerBoolProperty(layer, 'background')) !== undefined
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

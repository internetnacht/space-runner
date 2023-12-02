import { DEBUG, TILED_CUSTOM_CONSTANTS } from '../../constants'
import { ChunkContext } from '../../global-types'
import { GameCharacter } from '../characters/GameCharacter'
import { Point } from '../Point'

export class ChunkLayer {
	private readonly context: ChunkContext
	private readonly layer: Phaser.Tilemaps.TilemapLayer

	public constructor(
		context: ChunkContext,
		config: {
			tilemap: Phaser.Tilemaps.Tilemap
			name: string
			tileset: Phaser.Tilemaps.Tileset
			origin: Point
		}
	) {
		this.context = context
		const layer = config.tilemap.createLayer(
			config.name,
			[config.tileset],
			config.origin.x,
			config.origin.y
		)
		if (layer === null) {
			throw "map couldn't create layer " + config.name
		}

		if (DEBUG) {
			layer.forEachTile((tile) => {
				context.scene.add
					.rectangle(
						tile.layer.tilemapLayer.x + tile.pixelX,
						tile.layer.tilemapLayer.y + tile.pixelY,
						4,
						4,
						0x0
					)
					.setDepth(1000)
			})
		}

		this.layer = layer

		const background = this.layerGetBoolProperty(
			TILED_CUSTOM_CONSTANTS.layers.properties.background.name
		)
		if (!background) {
			this.layer.setCollisionByExclusion([])
			this.addColliders()
		}
	}

	private layerGetBoolProperty(propName: string) {
		const properties = this.layer.layer.properties
		return (
			//phaser uses object as the type for prop but object is completely unusable -> necessary to use any here
			properties.findIndex(function (prop: any) {
				return prop.name === propName && prop.value === true
			}) !== -1
		)
	}

	public addColliders() {
		const kill = this.layerGetBoolProperty(TILED_CUSTOM_CONSTANTS.layers.properties.kill.name)
		const finish = this.layerGetBoolProperty(
			TILED_CUSTOM_CONSTANTS.layers.properties.finish.name
		)

		this.context.scene.physics.add.collider(
			this.context.player.getCollider(),
			this.layer,
			(a, b) => {
				if (kill) {
					this.reactToKillCollision(a, b)
				}
				if (finish) {
					this.reactToFinishCollision(a, b)
				}
			},
			(_, tile) => this.characterHitsTile(tile as Phaser.Tilemaps.Tile, this.context.player)
		)
	}

	private characterHitsTile(tile: Phaser.Tilemaps.Tile, character: GameCharacter): boolean {
		if (!TILED_CUSTOM_CONSTANTS.layers.platforms.tileIds.includes(tile.index)) {
			return true
		}

		if (character.getBottom() > tile.layer.tilemapLayer.y + tile.pixelY) {
			return false
		} else if (character.isMovingDown()) {
			return false
		}

		return true
	}

	public reactToKillCollision(
		_: any,
		cause: Phaser.Tilemaps.Tile | Phaser.Types.Physics.Arcade.GameObjectWithBody
	) {
		this.context.player.kill(cause)
	}

	public reactToFinishCollision(
		target: Phaser.Tilemaps.Tile | Phaser.Types.Physics.Arcade.GameObjectWithBody,
		_: any
	) {
		this.context.player.reachFinishLine(target)
	}

	public setDepth(depth: number) {
		this.layer.setDepth(depth)

		if (this.layer.layer.name === TILED_CUSTOM_CONSTANTS.layers.spawn.name) {
			this.context.player.setDisplayDepth(depth)
		}
	}

	public destroy() {
		this.layer.destroy()
	}
}

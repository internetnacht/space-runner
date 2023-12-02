import { DEBUG, TILED_CUSTOM_CONSTANTS } from '../../constants'
import { ChunkContext } from '../../global-types'
import { TilemapLayerProperty, TilemapLayerPropertyT } from '../../tiled-types'
import { typecheck } from '../../utils'
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

		const background = this.getLayerBoolProperty(
			TILED_CUSTOM_CONSTANTS.layers.properties.background.name
		)
		if (!background) {
			this.layer.setCollisionByExclusion([])
			this.addColliders()
		}
	}

	private getLayerBoolProperty(propName: string): boolean {
		return (
			this.getLayerProperty(propName)
				.filter((prop) => prop.type === 'bool')
				.filter((prop) => prop.value === true).length > 0
		)
	}

	private getLayerProperty(propName: string): TilemapLayerPropertyT[] {
		return this.layer.layer.properties
			.map((prop: any) => typecheck(prop, TilemapLayerProperty))
			.filter((prop) => prop.name.toLowerCase() === propName.toLowerCase())
	}

	private getLayerStringProperty(propName: string): string[] {
		return this.getLayerProperty(propName)
			.filter((prop) => prop.type === 'string')
			.map((prop) => prop.value)
			.filter((v) => typeof v === 'string') as string[]
	}

	public addColliders() {
		const kill = this.getLayerBoolProperty(TILED_CUSTOM_CONSTANTS.layers.properties.kill.name)
		const finish = this.getLayerBoolProperty(
			TILED_CUSTOM_CONSTANTS.layers.properties.finish.name
		)
		const teleportToPlace = this.getTeleportPlace()
		console.log(teleportToPlace)

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
				if (teleportToPlace !== null) {
					this.reactToTeleportToPlaceCollision(teleportToPlace)
				}
			},
			(_, tile) => this.characterHitsTile(tile as Phaser.Tilemaps.Tile, this.context.player)
		)
	}

	private getTeleportPlace(): Point | null {
		const teleportTarget = this.getLayerStringProperty(
			TILED_CUSTOM_CONSTANTS.layers.properties.teleportToPlace.name
		)[0]
		if (teleportTarget === undefined) {
			return null
		}
		const targetLayer = this.context.globalLayers.find((layer) => layer.name === teleportTarget)
		if (targetLayer === undefined) {
			return null
		}

		const targetObject = targetLayer.objects[0]
		if (targetObject === undefined) {
			return null
		}

		return new Point(targetObject.x, targetObject.y)
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

		if (
			this.layer.layer.name.toLowerCase() ===
			TILED_CUSTOM_CONSTANTS.layers.player.name.toLowerCase()
		) {
			this.context.player.setDisplayDepth(depth)
		}
	}

	public reactToTeleportToPlaceCollision(target: Point) {
		this.context.player.teleportTo(target)
	}

	public destroy() {
		this.layer.destroy()
	}
}

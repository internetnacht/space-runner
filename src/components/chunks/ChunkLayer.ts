import { List } from 'immutable'
import { DEBUG, TILED_CUSTOM_CONSTANTS, taskUnlockers } from '../../constants'
import { ChunkContext } from './ChunkContext'
import { getLayerBoolProperty, getLayerStringProperty } from '../../utils/utils'
import { GameCharacter } from '../characters/GameCharacter'
import { PixelPoint } from '../../utils/points/PixelPoint'
import { TilePoint } from '../../utils/points/TilePoint'
import { TileCheckpoint } from '../../utils/checkpoints/TileCheckpoint'
import { InternalGameError } from '../../errors/InternalGameError'

export class ChunkLayer {
	private readonly context: ChunkContext
	private readonly layer: Phaser.Tilemaps.TilemapLayer
	private readonly colliders: List<Phaser.Physics.Arcade.Collider>

	public constructor(
		context: ChunkContext,
		config: {
			tilemap: Phaser.Tilemaps.Tilemap
			name: string
			tileset: Phaser.Tilemaps.Tileset
			origin: PixelPoint
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

		const background = getLayerBoolProperty(
			this.layer.layer,
			TILED_CUSTOM_CONSTANTS.layers.properties.background.name
		)
		if (!background) {
			this.layer.setCollisionByExclusion([])
			this.colliders = this.createColliders(config.origin)
		} else {
			this.colliders = List()
		}
	}

	public createColliders(origin: PixelPoint): List<Phaser.Physics.Arcade.Collider> {
		const kill = getLayerBoolProperty(
			this.layer.layer,
			TILED_CUSTOM_CONSTANTS.layers.properties.kill.name
		)
		const finish = getLayerBoolProperty(
			this.layer.layer,
			TILED_CUSTOM_CONSTANTS.layers.properties.finish.name
		)
		const teleportToPlace = this.getTeleportPlace()

		const hasCheckpoints = this.hasCheckpoints()

		const taskUnlocker = getLayerBoolProperty(
			this.layer.layer,
			TILED_CUSTOM_CONSTANTS.layers.properties.unlockTask.name
		)

		const playerCollider = this.context.scene.physics.add.collider(
			this.context.player.getCollider(),
			this.layer,
			(a, b) => {
				// physics.add.collider doesn't add colliders but instead sets them, meaning you can't have multiple colliders on the same pair
				if (kill) {
					this.reactToKillCollision(a, b)
				}
				if (finish) {
					this.reactToFinishCollision(a, b)
				}
				if (teleportToPlace !== null) {
					this.reactToTeleportToPlaceCollision(teleportToPlace)
				}
				if (hasCheckpoints) {
					if (!(b instanceof Phaser.Tilemaps.Tile)) {
						throw new InternalGameError('collision party has unexpected type: ' + b)
					}
					const tileOrigin = origin.toTilePoint()
					this.context.player.checkpoint = new TileCheckpoint(
						tileOrigin.x + b.x,
						tileOrigin.y + b.y
					)
				}
				if (taskUnlocker) {
					const unlocker = taskUnlockers.find(
						(unlocker) =>
							unlocker[0] === this.context.worldSceneKey &&
							unlocker[1] === this.layer.layer.name
					)

					if (unlocker === undefined) {
						throw new InternalGameError(
							`couldnt find unlocker of layer ${this.layer.layer.name} in level ${this.context.worldSceneKey}`
						)
					}

					const taskId = String(unlocker[2])

					this.context.taskUnlocker.unlock(taskId)
				}
			},
			(_, tile) => this.characterHitsTile(tile as Phaser.Tilemaps.Tile, this.context.player)
		)

		const npcsCollider = this.context.npcs.map((npc) =>
			this.context.scene.physics.add.collider(npc.getCollider(), this.layer)
		)

		return npcsCollider.push(playerCollider)
	}

	private getTeleportPlace(): PixelPoint | null {
		const teleportTarget = getLayerStringProperty(
			this.layer.layer,
			TILED_CUSTOM_CONSTANTS.layers.properties.teleportToPlace.name
		)
		if (teleportTarget === null) {
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

		return new PixelPoint(targetObject.x, targetObject.y)
	}

	private characterHitsTile(tile: Phaser.Tilemaps.Tile, character: GameCharacter): boolean {
		if (!TILED_CUSTOM_CONSTANTS.layers.platforms.tileIds.includes(tile.index)) {
			return true
		}

		// tile.setCollision(true, ...) might be useful here
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
			this.layer.layer.name.toLowerCase().trim() ===
			TILED_CUSTOM_CONSTANTS.layers.player.name.toLowerCase()
		) {
			this.context.player.setDisplayDepth(depth)
		}
	}

	public reactToTeleportToPlaceCollision(target: PixelPoint) {
		this.context.player.teleportTo(target)
	}

	public destroy() {
		this.layer.destroy()
		this.colliders.forEach((collider) =>
			this.context.scene.physics.world.removeCollider(collider)
		)
	}

	public getTileAt(position: TilePoint): Phaser.Tilemaps.Tile {
		return this.layer.getTileAt(position.x, position.y)
	}

	public hasCheckpoints(): boolean {
		return this.layer.layer.name
			.toLowerCase()
			.startsWith(TILED_CUSTOM_CONSTANTS.layers.checkpoint.name.toLowerCase())
	}
}

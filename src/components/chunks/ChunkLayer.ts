import { TILED_CUSTOM_CONSTANTS } from '../../constants'
import { ChunkContext, Point } from '../../global-types'

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
		this.layer = layer

		this.addColliders()
		this.addKillsProperty()
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
		if (this.layerGetBoolProperty(TILED_CUSTOM_CONSTANTS.layers.properties.collide.name)) {
			this.layer.setCollisionByExclusion([])
			if (this.context.player === undefined) {
				throw 'player is unexpectedly undefined'
			}
			this.context.scene.physics.add.collider(this.context.player.getCollider(), this.layer)
		}
	}

	public addKillsProperty() {
		if (this.layerGetBoolProperty(TILED_CUSTOM_CONSTANTS.layers.properties.kill.name)) {
			this.layer.setCollisionByExclusion([])
			this.context.scene.physics.add.collider(
				this.context.player.getCollider(),
				this.layer,
				(_, layer) => {
					this.context.player.kill(layer)
				}
			)
		}
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

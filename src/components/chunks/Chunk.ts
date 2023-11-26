import { List } from 'immutable'
import { ChunkContext, ChunkId, Point } from '../../global-types'
import { ChunkLayer } from './ChunkLayer'
import { MEASURES, SCENE_ASSET_KEYS, TILED_TILESET_NAME } from '../../constants'
import { MapChunkT } from '../../tiled-types'

export class Chunk {
	private readonly context: ChunkContext
	private readonly origin: Point
	private readonly id: ChunkId
	private readonly tilemap: Phaser.Tilemaps.Tilemap
	private readonly layers: List<ChunkLayer>

	public constructor(context: ChunkContext, chunkJSON: Readonly<MapChunkT>, origin: Point) {
		this.context = context
		this.origin = origin
		this.id = chunkJSON.id

		this.tilemap = this.createTilemap(chunkJSON)
		this.layers = this.createChunkTilemapLayers(context, this.tilemap, chunkJSON)
		this.setLayerDepths()
	}

	public static computeOrigin(
		id: ChunkId,
		chunkMeasures: {
			horizontalChunkAmount: number
			chunkWidth: number
			chunkHeight: number
		}
	): Point {
		const chunkX = id % chunkMeasures.horizontalChunkAmount
		const chunkY = Math.floor(id / chunkMeasures.horizontalChunkAmount)

		const offsetX = chunkX * chunkMeasures.chunkWidth * MEASURES.tiles.width
		const offsetY = chunkY * chunkMeasures.chunkHeight * MEASURES.tiles.height

		return { x: offsetX, y: offsetY }
	}

	public static computeChunkId(
		x: number,
		y: number,
		measures: { horizontalChunkAmount: number; chunkWidth: number; chunkHeight: number }
	): number {
		const tileX = Math.floor(x / MEASURES.tiles.width)
		const tileY = Math.floor(y / MEASURES.tiles.height)
		const chunkX = Math.floor(tileX / measures.chunkWidth)
		const chunkY = Math.floor(tileY / measures.chunkHeight)

		return chunkY * measures.horizontalChunkAmount + chunkX
	}

	public is(id: ChunkId): boolean {
		return id === this.id
	}

	public destroy() {
		this.tilemap.destroy()
		this.layers.forEach((layer) => layer.destroy())
	}

	private createTilemap(chunkJSON: MapChunkT): Phaser.Tilemaps.Tilemap {
		return this.context.scene.make.tilemap({
			key: SCENE_ASSET_KEYS.maps.chunk(this.context.worldSceneKey, chunkJSON.id),
			tileWidth: chunkJSON.tilewidth,
			tileHeight: chunkJSON.tileheight,
			width: chunkJSON.width,
			height: chunkJSON.height,
			insertNull: true,
		})
	}

	private createChunkTilemapLayers(
		context: ChunkContext,
		chunkTileMap: Phaser.Tilemaps.Tilemap,
		chunkJSON: MapChunkT
	): List<ChunkLayer> {
		// debug
		context.scene.add
			.rectangle(
				this.origin.x,
				this.origin.y,
				chunkJSON.width * MEASURES.tiles.width,
				chunkJSON.height * MEASURES.tiles.height
			)
			.setOrigin(0, 0)
			.setStrokeStyle(2, 0x1a65ac)
			.setDepth(100)
		// debug

		const tileset = chunkTileMap.addTilesetImage(
			TILED_TILESET_NAME,
			SCENE_ASSET_KEYS.maps.tileset(context.worldSceneKey)
		)
		if (tileset === null) {
			throw (
				'failed to create tileset object for chunk ' +
				chunkJSON.id +
				' of world ' +
				context.worldSceneKey
			)
		}

		const tileLayerNames = List(chunkJSON.layers)
			.filter((layer) => layer.type === 'tilelayer')
			.map((layer) => String(layer.name))

		return tileLayerNames.map(
			(layerName) =>
				new ChunkLayer(context, {
					tilemap: chunkTileMap,
					name: layerName,
					tileset,
					origin: this.origin,
				})
		)
	}

	private setLayerDepths() {
		for (const [index, layer] of this.layers.entries()) {
			layer.setDepth(MEASURES.maps.layerDepthOffset + index)
		}
	}
}
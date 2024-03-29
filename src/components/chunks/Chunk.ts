import { List } from 'immutable'
import { ChunkContext } from './ChunkContext'
import { ChunkLayer } from './ChunkLayer'
import { DEBUG, MEASURES, SCENE_ASSET_KEYS, TILED_TILESET_NAME } from '../../constants'
import { MapChunkT } from '../../tiled-types'
import { ChunkOutOfMapError } from '../../errors/ChunkOutOfMapError'
import { PixelPoint } from '../../utils/points/PixelPoint'
import { ChunkPoint } from '../../utils/points/ChunkPoint'
import { TilePoint } from '../../utils/points/TilePoint'

export type ChunkId = number

export class Chunk {
	private readonly context: ChunkContext
	private readonly origin: PixelPoint
	private readonly id: ChunkId
	private readonly tilemap: Phaser.Tilemaps.Tilemap
	private readonly layers: List<ChunkLayer>

	public constructor(context: ChunkContext, chunkJSON: Readonly<MapChunkT>, origin: PixelPoint) {
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
	): PixelPoint {
		const chunkX = id % chunkMeasures.horizontalChunkAmount
		const chunkY = Math.floor(id / chunkMeasures.horizontalChunkAmount)

		const offsetX = chunkX * chunkMeasures.chunkWidth * MEASURES.tiles.width
		const offsetY = chunkY * chunkMeasures.chunkHeight * MEASURES.tiles.height

		return new PixelPoint(offsetX, offsetY)
	}

	/**
	 * @throws ChunkOutOfMapError
	 */
	public static computeChunkId(
		point: PixelPoint,
		measures: { mapWidth: number; mapHeight: number; chunkWidth: number; chunkHeight: number }
	): number {
		if (
			point.x < 0 ||
			point.y < 0 ||
			point.x >= measures.mapWidth ||
			point.y >= measures.mapHeight
		) {
			throw new ChunkOutOfMapError(point)
		}

		const { x, y } = Chunk.computeChunkCoordinates(point, measures)
		const horizontalChunkAmount = measures.mapWidth / measures.chunkWidth

		return x * horizontalChunkAmount + y
	}

	public static computeChunkCoordinates(
		point: PixelPoint,
		measures: {
			chunkWidth: number
			chunkHeight: number
		}
	): ChunkPoint {
		const tileX = Math.floor(point.x / MEASURES.tiles.width)
		const tileY = Math.floor(point.y / MEASURES.tiles.height)
		const chunkX = Math.floor(tileX / measures.chunkWidth)
		const chunkY = Math.floor(tileY / measures.chunkHeight)

		return new ChunkPoint(chunkX, chunkY)
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
		if (DEBUG) {
			context.scene.add
				.text(this.origin.x, this.origin.y, String(chunkJSON.id))
				.setDepth(1000)
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
		}

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

	public getTilesAt(position: TilePoint): List<Phaser.Tilemaps.Tile> {
		return this.layers.map((layer) => layer.getTileAt(position)).filter((tile) => tile !== null)
	}

	/**
	 * @param position position in pixel coordinates
	 *
	 * @return position pixel coordinates relative to this chunk's origin (can be outside of this chunk)
	 */
	public positionToChunkRelativeCoordinates(position: PixelPoint): PixelPoint {
		return new PixelPoint(position.x - this.origin.x, position.y - this.origin.y)
	}
}

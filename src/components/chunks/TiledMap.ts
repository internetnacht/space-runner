import { List } from 'immutable'
import { DEBUG, SCENE_ASSET_KEYS, filePaths } from '../../constants'
import { ChunkId } from './Chunk'
import { ChunkContext } from './ChunkContext'
import { typecheck } from '../../utils/utils'
import { MapChunk, MapChunkT, MapMasterT } from '../../tiled-types'
import { Chunk } from './Chunk'
import { PixelPoint } from '../../utils/points/PixelPoint'
import { ChunkPoint } from '../../utils/points/ChunkPoint'
import { TilePoint } from '../../utils/points/TilePoint'
import { TilemapJSONAsset } from '../../assets/TilemapJSONAsset'
import { JSONAsset } from '../../assets/JSONAsset'

export class TiledMap {
	private currentChunkCoordinates: ChunkPoint | null
	private currentlyLoadedChunks: List<Chunk>
	private readonly mapMaster: MapMasterT

	public constructor(mapMasterFile: MapMasterT) {
		this.currentChunkCoordinates = null
		this.mapMaster = mapMasterFile
		this.currentlyLoadedChunks = List()
	}

	public async update(position: PixelPoint, context: ChunkContext) {
		const chunkCoordinates = Chunk.computeChunkCoordinates(position, {
			//smaller border chunks don't cause problems because they're at the border -> their id stays the same, just the map ends sooner than normal
			chunkWidth: this.mapMaster.chunkWidth,
			chunkHeight: this.mapMaster.chunkHeight,
		})

		// this technique is essential for usable FPS, without it FPS drop gradually below 15 or less
		if (
			this.currentChunkCoordinates !== null &&
			this.currentChunkCoordinates.equals(chunkCoordinates)
		)
			return

		this.currentChunkCoordinates = chunkCoordinates
		await this.updateVisibleChunks(chunkCoordinates, context)
	}

	private async updateVisibleChunks(centerChunkCoordinates: ChunkPoint, context: ChunkContext) {
		const nextVisibleChunks = this.getLoadedChunkArea(centerChunkCoordinates)
		if (DEBUG) {
			console.log(`nextvisiblechunks: ${JSON.stringify(nextVisibleChunks.toArray())}`)
		}

		const newVisibleChunks = nextVisibleChunks.filter(
			(chunkId) =>
				this.currentlyLoadedChunks.find((loadedChunk) => loadedChunk.is(chunkId)) ===
				undefined
		)

		const unwantedChunks = this.currentlyLoadedChunks.filter(
			(currentlyLoadedChunk) =>
				nextVisibleChunks.find((nextVisibleChunkId) =>
					currentlyLoadedChunk.is(nextVisibleChunkId)
				) === undefined
		)

		const chunkCreationPromises = newVisibleChunks
			.map((chunk) => this.loadChunk(context, chunk))
			.map((chunk) => this.createChunk(context, chunk))

		const newChunks: Chunk[] = []
		for (const prom of chunkCreationPromises) {
			newChunks.push(await prom)
		}

		const stillVisibleOldChunks = this.currentlyLoadedChunks.filter(
			(currentlyLoadedChunk) =>
				nextVisibleChunks.find((nextVisibleChunkId) =>
					currentlyLoadedChunk.is(nextVisibleChunkId)
				) !== undefined
		)

		this.currentlyLoadedChunks = stillVisibleOldChunks.concat(newChunks)
		unwantedChunks.forEach((chunk) => chunk.destroy())
	}

	private async loadChunk(context: ChunkContext, chunk: ChunkId): Promise<ChunkId> {
		const chunkFilePath = filePaths.maps.chunk(context.worldSceneKey, chunk)

		const chunkMap = new TilemapJSONAsset(
			SCENE_ASSET_KEYS.maps.chunk(context.worldSceneKey, chunk),
			chunkFilePath
		)
		const chunkJSON = new JSONAsset(
			SCENE_ASSET_KEYS.maps.chunkJSON(context.worldSceneKey, chunk),
			chunkFilePath
		)

		await chunkMap.load(context.scene)
		await chunkJSON.load(context.scene)

		return chunk
	}

	private async createChunk(context: ChunkContext, chunkLoadedPromise: Promise<ChunkId>) {
		const chunk = await chunkLoadedPromise
		const chunkJSON: Readonly<MapChunkT> = typecheck(
			context.scene.cache.json.get(
				SCENE_ASSET_KEYS.maps.chunkJSON(context.worldSceneKey, chunk)
			),
			MapChunk
		)
		const chunkOrigin = Chunk.computeOrigin(chunk, {
			horizontalChunkAmount: this.mapMaster.horizontalChunkAmount,
			chunkWidth: this.mapMaster.chunkWidth,
			chunkHeight: this.mapMaster.chunkHeight,
		})

		return new Chunk(context, chunkJSON, chunkOrigin)
	}

	private getLoadedChunkArea(centerChunkCoordinates: ChunkPoint): List<ChunkId> {
		/**
		 * smaller chunks at the bottom and right border are no problem because chunk coordinates point to the top left chunk corner
		 */
		const left = -1
		const top = 1
		const right = 1
		const bottom = -1

		const surrounding: number[] = []

		const addIfValid = (hori: number, verti: number) => {
			const surroundingX = centerChunkCoordinates.x + hori
			const surroundingY = centerChunkCoordinates.y + verti

			if (this.chunkCoordinatesAreValid(new ChunkPoint(surroundingX, surroundingY))) {
				surrounding.push(surroundingY * this.mapMaster.horizontalChunkAmount + surroundingX)
			}
		}

		addIfValid(left, top)
		addIfValid(0, top)
		addIfValid(right, top)
		addIfValid(left, 0)
		addIfValid(0, 0)
		addIfValid(right, 0)
		addIfValid(left, bottom)
		addIfValid(0, bottom)
		addIfValid(right, bottom)

		return List(surrounding)
	}

	private chunkCoordinatesAreValid(chunkCoordinates: ChunkPoint): boolean {
		return (
			chunkCoordinates.x >= 0 &&
			chunkCoordinates.y >= 0 &&
			chunkCoordinates.x < this.mapMaster.horizontalChunkAmount &&
			chunkCoordinates.y < this.mapMaster.verticalChunkAmount
		)
	}

	/**
	 * @param position
	 *
	 * @return chunk at given position or null if it doesn't exist or isn't loaded right now
	 */
	public getLoadedChunkAt(position: PixelPoint): Chunk | null {
		const chunkCoordinates = Chunk.computeChunkCoordinates(position, {
			chunkWidth: this.mapMaster.chunkWidth,
			chunkHeight: this.mapMaster.chunkHeight,
		})

		const chunkId: ChunkId =
			chunkCoordinates.x + chunkCoordinates.y * this.mapMaster.horizontalChunkAmount

		const currentChunk = this.currentlyLoadedChunks.filter((chunk) => chunk.is(chunkId))
		if (currentChunk.size === 0) {
			return null
		} else if (currentChunk.size > 1) {
			throw 'unexpected amount of current chunks: ' + currentChunk.size
		}

		return currentChunk.first()
	}

	public getTilesAt(position: TilePoint): List<Phaser.Tilemaps.Tile> {
		const chunk = this.getLoadedChunkAt(position.toPixelCoordinates())

		if (chunk === null) {
			return List()
		}

		const chunkRelativeCoordinates = chunk.positionToChunkRelativeCoordinates(
			position.toPixelCoordinates()
		)
		return chunk.getTilesAt(chunkRelativeCoordinates.toTileCoordinates())
	}
}

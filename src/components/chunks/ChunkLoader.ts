import { List } from 'immutable'
import { SCENE_ASSET_KEYS, filePaths } from '../../constants'
import { ChunkContext, ChunkId } from '../../global-types'
import { loadFile, typecheck } from '../../utils'
import { MapChunk, MapChunkT, MapMasterT } from '../../tiled-types'
import { Chunk } from './Chunk'

export default class ChunkLoader {
	private currentChunk: Chunk | null
	private currentlyLoadedChunks: List<Chunk>
	private readonly mapMaster: MapMasterT

	public constructor(mapMasterFile: MapMasterT) {
		this.currentChunk = null
		this.mapMaster = mapMasterFile
		this.currentlyLoadedChunks = List()
	}

	public async update(x: number, y: number, context: ChunkContext) {
		const chunkId = Chunk.computeChunkId(x, y, {
			horizontalChunkAmount: this.mapMaster.horizontalChunkAmount,
			//smaller border chunks don't cause problems because they're at the border -> their id stays the same, just the map ends sooner than normal
			chunkWidth: this.mapMaster.chunkWidth,
			chunkHeight: this.mapMaster.chunkHeight,
		})

		// this technique is essential for usable FPS, without it FPS drop gradually below 15 or less
		if (this.currentChunk !== null && this.currentChunk.is(chunkId)) return

		return this.updateVisibleChunks(chunkId, context)
	}

	private async updateVisibleChunks(centerChunkId: ChunkId, context: ChunkContext) {
		const nextVisibleChunks = this.getLoadedChunkArea(centerChunkId)

		const newVisibleChunks = nextVisibleChunks.filter(
			(newVisibleChunkId) =>
				this.currentlyLoadedChunks.find((loadedChunk) =>
					loadedChunk.is(newVisibleChunkId)
				) === undefined
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

		unwantedChunks.forEach((chunk) => chunk.destroy())

		const loadedChunks = await Promise.all(chunkCreationPromises)

		const centerChunk = loadedChunks.find((chunk) => chunk.is(centerChunkId))
		if (centerChunk === undefined) {
			throw 'couldnt find center chunk after creating chunks'
		}
		this.currentChunk = centerChunk
	}

	private async loadChunk(context: ChunkContext, chunk: ChunkId): Promise<ChunkId> {
		const chunkFilePath = filePaths.maps.chunk(context.worldSceneKey, chunk)

		const chunkMapProm = loadFile(
			{
				key: SCENE_ASSET_KEYS.maps.chunk(context.worldSceneKey, chunk),
				type: 'tilemapJSON',
				filePath: chunkFilePath,
			},
			context.scene.load,
			(key) => context.scene.load.tilemapTiledJSON(key, chunkFilePath),
			(key) => context.scene.cache.tilemap.get(key) !== undefined
		)

		const chunkJSONProm = loadFile(
			{
				key: SCENE_ASSET_KEYS.maps.chunkJSON(context.worldSceneKey, chunk),
				type: 'json',
				filePath: chunkFilePath,
			},
			context.scene.load,
			(key) => context.scene.load.json(key, chunkFilePath),
			(key) => context.scene.cache.json.get(key) !== undefined
		)

		await chunkJSONProm
		await chunkMapProm

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
			chunkWidth: chunkJSON.width,
			chunkHeight: chunkJSON.height,
		})

		return new Chunk(context, chunkJSON, chunkOrigin)
	}

	private getLoadedChunkArea(chunkId: ChunkId): List<ChunkId> {
		const chunkX = chunkId % this.mapMaster.horizontalChunkAmount
		const chunkY = Math.floor(chunkId / this.mapMaster.horizontalChunkAmount)

		const left = -1
		const top = 1
		const right = 1
		const bottom = -1

		const surrounding: number[] = []

		const addIfValid = (hori: number, verti: number) => {
			const surroundingX = chunkX + hori
			const surroundingY = chunkY + verti
			if (this.chunkCoordinatesAreValid(surroundingX, surroundingY)) {
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

	private chunkCoordinatesAreValid(chunkX: number, chunkY: number): boolean {
		return (
			chunkX >= 0 &&
			chunkY >= 0 &&
			chunkX < this.mapMaster.horizontalChunkAmount &&
			chunkY < this.mapMaster.verticalChunkAmount
		)
	}
}

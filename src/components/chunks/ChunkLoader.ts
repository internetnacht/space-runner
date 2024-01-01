import { List } from 'immutable'
import { DEBUG, SCENE_ASSET_KEYS, filePaths } from '../../constants'
import { ChunkContext, ChunkId } from '../../global-types'
import { loadFile, typecheck } from '../../utils'
import { MapChunk, MapChunkT, MapMasterT } from '../../tiled-types'
import { Chunk } from './Chunk'
import { Point } from '../Point'

export class ChunkLoader {
	private currentChunkCoordinates: Point | null
	private currentlyLoadedChunks: List<Chunk>
	private readonly mapMaster: MapMasterT

	public constructor(mapMasterFile: MapMasterT) {
		this.currentChunkCoordinates = null
		this.mapMaster = mapMasterFile
		this.currentlyLoadedChunks = List()
	}

	public async update(position: Point, context: ChunkContext) {
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

	private async updateVisibleChunks(centerChunkCoordinates: Point, context: ChunkContext) {
		const nextVisibleChunks = this.getLoadedChunkArea(centerChunkCoordinates)
		if (DEBUG) {
			console.log(nextVisibleChunks.toArray())
		}

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

		await Promise.all(chunkCreationPromises)
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
			chunkWidth: this.mapMaster.chunkWidth,
			chunkHeight: this.mapMaster.chunkHeight,
		})

		return new Chunk(context, chunkJSON, chunkOrigin)
	}

	private getLoadedChunkArea(centerChunkCoordinates: Point): List<ChunkId> {
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

			if (this.chunkCoordinatesAreValid(new Point(surroundingX, surroundingY))) {
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

	private chunkCoordinatesAreValid(chunkCoordinates: Point): boolean {
		return (
			chunkCoordinates.x >= 0 &&
			chunkCoordinates.y >= 0 &&
			chunkCoordinates.x < this.mapMaster.horizontalChunkAmount &&
			chunkCoordinates.y < this.mapMaster.verticalChunkAmount
		)
	}
}

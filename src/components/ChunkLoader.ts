import { List } from 'immutable'
import {
	MEASURES,
	SCENE_ASSET_KEYS,
	TILED_CUSTOM_CONSTANTS,
	TILED_TILESET_NAME,
	filePaths,
} from '../constants'
import { ChunkContext, ChunkId } from '../global-types'
import { computeChunkId, layerGetBoolProperty, loadFile, typecheck } from '../utils'
import { MapChunk, MapMasterT } from '../tiled-types'

export default class ChunkLoader {
	private currentChunk: ChunkId
	private currentlyLoadedChunks: { id: ChunkId; tilemap: Phaser.Tilemaps.Tilemap }[]
	private readonly mapMaster: MapMasterT

	public constructor(initialChunk: ChunkId, mapMasterFile: MapMasterT) {
		this.currentChunk = initialChunk
		this.mapMaster = mapMasterFile
		this.currentlyLoadedChunks = []
	}

	public async update(x: number, y: number, context: ChunkContext) {
		const chunkId = computeChunkId(x, y, {
			horizontalChunkAmount: this.mapMaster.horizontalChunkAmount,
			chunkWidth: this.mapMaster.chunkWidth,
			chunkHeight: this.mapMaster.chunkHeight,
		})

		if (this.currentChunk === chunkId) return

		this.currentChunk = chunkId
		return this.updateVisibleChunks(chunkId, context)
	}

	private async updateVisibleChunks(chunk: ChunkId, context: ChunkContext) {
		const surroundingChunks = this.getSurroundingChunks(chunk)
		const nextVisibleChunks = surroundingChunks.push(chunk)

		const newVisibleChunks = nextVisibleChunks.filter(
			(chunk) => !this.currentlyLoadedChunks.map((c) => c.id).includes(chunk)
		)

		const unwantedChunks = this.currentlyLoadedChunks.filter(
			(chunk) => !nextVisibleChunks.includes(chunk.id)
		)

		const chunkCreationPromises = newVisibleChunks
			.map(this.loadChunk(context))
			.map(this.createChunk(context))

		unwantedChunks.forEach(this.destroyOldChunk)

		return Promise.all(chunkCreationPromises)
	}

	private loadChunk(context: ChunkContext) {
		return async (chunk: ChunkId) => {
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
	}

	private createChunk(context: ChunkContext) {
		return async (chunkProm: Promise<ChunkId>) => {
			const chunk = await chunkProm

			const chunkX = chunk % this.mapMaster.horizontalChunkAmount
			const chunkY = Math.floor(chunk / this.mapMaster.horizontalChunkAmount)

			const offsetX = chunkX * this.mapMaster.chunkWidth * MEASURES.tiles.width
			const offsetY = chunkY * this.mapMaster.chunkHeight * MEASURES.tiles.height

			const chunkJSON = typecheck(
				context.scene.cache.json.get(
					SCENE_ASSET_KEYS.maps.chunkJSON(context.worldSceneKey, chunk)
				),
				MapChunk
			)

			const chunkTileMap = context.scene.make.tilemap({
				key: SCENE_ASSET_KEYS.maps.chunk(context.worldSceneKey, chunk),
				tileWidth: this.mapMaster.tileWidth,
				tileHeight: this.mapMaster.tileHeight,
				width: chunkJSON.width,
				height: chunkJSON.height,
				insertNull: true,
			})

			const tileset = chunkTileMap.addTilesetImage(
				TILED_TILESET_NAME,
				SCENE_ASSET_KEYS.maps.tileset(context.worldSceneKey)
			)
			if (tileset === null) {
				throw (
					'failed to create tileset object for chunk ' +
					chunk +
					' of world ' +
					context.worldSceneKey
				)
			}

			const tileLayerNames = List(chunkJSON.layers)
				.filter((layer) => layer.type === 'tilelayer')
				.map((layer) => String(layer.name))

			const layers = tileLayerNames.map((layerName) => {
				const layer = chunkTileMap.createLayer(layerName, [tileset], offsetX, offsetY)
				if (layer === null) {
					throw "map couldn't create layer " + layerName
				}
				//layer.setOrigin(0,0)

				if (
					layerGetBoolProperty(
						layer,
						TILED_CUSTOM_CONSTANTS.layers.properties.collide.name
					)
				) {
					layer.setCollisionByExclusion([])
					if (context.player === undefined) {
						throw 'player is unexpectedly undefined'
					}
					context.scene.physics.add.collider(context.player.getCollider(), layer)
				}

				return layer
			})

			for (const [index, layer] of layers.entries()) {
				const depth = MEASURES.maps.layerDepthOffset + index
				if (layer.layer.name === TILED_CUSTOM_CONSTANTS.layers.spawn.name) {
					context.player.setDisplayDepth(depth)
				} else {
					layer.setDepth(depth)
				}
			}

			context.scene.add
				.rectangle(
					offsetX,
					offsetY,
					this.mapMaster.chunkWidth * MEASURES.tiles.width,
					this.mapMaster.chunkHeight * MEASURES.tiles.height
				)
				.setOrigin(0, 0)
				.setStrokeStyle(2, 0x1a65ac)
				.setDepth(100)
		}
	}

	private destroyOldChunk(chunk: { id: ChunkId; tilemap: Phaser.Tilemaps.Tilemap }) {
		chunk.tilemap.destroy()
	}

	private getSurroundingChunks(chunkId: ChunkId): List<ChunkId> {
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

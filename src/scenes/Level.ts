import { Player } from '../components/characters/Player.ts'
import {
	GLOBAL_ASSET_KEYS,
	MEASURES,
	SCENE_ASSET_KEYS,
	TILED_CUSTOM_CONSTANTS,
	filePaths,
} from '../constants.ts'
import { MusicPlayer } from '../components/MusicPlayer.ts'
import { GameSettings } from '../components/GameSettings.ts'
import { getLayerBoolProperty, typecheck } from '../utils/utils.ts'
import { TiledMap } from '../components/chunks/TiledMap.ts'
import { MapMaster, MapMasterT } from '../tiled-types.ts'
import { GameCharacter } from '../components/characters/GameCharacter.ts'
import { MovementPathPoint } from '../components/map-components/MovementPathPoint.ts'
import { List } from 'immutable'
import { MovingPlatform } from '../components/map-components/MovingPlatform.ts'
import { Platform } from '../components/map-components/Platform.ts'
import { ChunkContext } from '../global-types.ts'
import { EdgeToEdgeNPC } from '../components/characters/EdgeToEdgeNPC.ts'
import { PixelPoint } from '../utils/points/PixelPoint.ts'

export class Level extends Phaser.Scene {
	private player?: Player
	private npcs?: List<GameCharacter>
	private movingPlatforms?: List<MovingPlatform>
	private readonly _id: string
	private userSettings?: GameSettings
	private tiledMap?: TiledMap
	private chunkContext?: ChunkContext

	public get id(): string {
		return this._id
	}

	public constructor(worldId: string) {
		super({
			key: worldId,
		})

		this._id = worldId
	}

	public init(data: Record<string, unknown>) {
		if (data.userSettings instanceof GameSettings) {
			this.userSettings = data.userSettings
		}
	}

	public preload() {
		this.load.image(SCENE_ASSET_KEYS.maps.tileset(this._id), filePaths.sprites.sheet)
		this.load.image(GLOBAL_ASSET_KEYS.images.background, filePaths.images.background)
		this.load.json(SCENE_ASSET_KEYS.maps.master(this._id), filePaths.maps.master(this._id))
	}

	public create() {
		const musicplayer = new MusicPlayer(this, this.userSettings)
		musicplayer.loop('audio-background')

		const mapMaster = typecheck(
			this.cache.json.get(SCENE_ASSET_KEYS.maps.master(this._id)),
			MapMaster
		)

		const spawnCoordinates = this.extractSpawnCoordinates(mapMaster)
		this.npcs = this.createNPCs(mapMaster)

		this.tiledMap = new TiledMap(mapMaster)
		const player = new Player(
			this,
			(cause) => {
				this.scene.launch('DeathScene', {
					userSettings: this.userSettings,
					callingScene: this._id,
					deathCause: cause,
					musicplayer,
				})
				this.scene.pause()
			},
			() => {
				this.scene.launch('FinishedScreen', {
					userSettings: this.userSettings,
					callingScene: this._id,
					musicplayer: musicplayer,
				})
				this.scene.pause()
			},
			spawnCoordinates
		)
		this.player = player

		this.npcs
			.filter((npc) => npc.lethal)
			.forEach((npc) => {
				this.physics.add.collider(npc.getCollider(), player.getCollider(), (a, _) =>
					player.kill(a)
				)
			})

		this.chunkContext = {
			player: this.player,
			npcs: this.npcs,
			scene: this,
			worldSceneKey: this._id,
			globalLayers: mapMaster.globalLayers,
		}

		this.tiledMap.update(this.player.getPosition(), this.chunkContext).then(() => {
			this.player?.unfreeze()
			this.npcs?.forEach((npc) => npc.unfreeze())
		})

		this.movingPlatforms = this.addMovingPlatforms(
			mapMaster,
			List<GameCharacter>().push(this.player).concat(this.npcs)
		)
		this.setupCamera()
		this.addBackgroundImage(
			mapMaster.mapWidth * mapMaster.tileWidth,
			mapMaster.mapHeight * mapMaster.chunkHeight
		)
		this.addPauseMenuCallbacks()

		this.events.on('shutdown', () => {
			this.player?.shutdown()
			musicplayer?.shutdown()
		})
	}

	private extractSpawnCoordinates(mapMaster: MapMasterT): PixelPoint {
		const defaultSpawn = MEASURES.player.spawn.default
		const spawnLayer = mapMaster.globalLayers.find(
			(layer) =>
				layer.name.toLowerCase() === TILED_CUSTOM_CONSTANTS.layers.spawn.name.toLowerCase()
		)

		if (spawnLayer === undefined) {
			return new PixelPoint(defaultSpawn.x, defaultSpawn.y)
		} else {
			const spawnObj = spawnLayer.objects[0]
			if (spawnObj === undefined) {
				return new PixelPoint(defaultSpawn.x, defaultSpawn.y)
			} else {
				return new PixelPoint(spawnObj.x, spawnObj.y)
			}
		}
	}

	public update() {
		//console.log(this.game.loop.actualFps)
		if (this.player === undefined) {
			throw 'player is unexpectedly undefined'
		}

		if (this.tiledMap === undefined) {
			throw 'chunk loader is unexpectedly undefined'
		}
		if (this.chunkContext === undefined) {
			throw 'chunk context is unexpectedly undefined'
		}

		// freeze npcs that slipped out of loaded area
		this.npcs
			?.filter((npc) => !npc.isFrozen())
			.filter((npc) => this.tiledMap?.getLoadedChunkAt(npc.getPosition()) === null)
			.forEach((npc) => npc.freeze())

		// unfreeze npcs that entered loaded area
		this.npcs
			?.filter((npc) => npc.isFrozen())
			.filter((npc) => this.tiledMap?.getLoadedChunkAt(npc.getPosition()) !== null)
			.forEach((npc) => npc.unfreeze())

		this.tiledMap.update(this.player.getPosition(), this.chunkContext).then(() => {
			this.player?.update(this, this.tiledMap)
			this.npcs
				?.filter((npc) => !npc.isFrozen())
				.forEach((npc) => npc.update(this, this.tiledMap))
		})

		this.movingPlatforms?.forEach((platform) => platform.update())
	}

	private setupCamera() {
		if (this.player === undefined) {
			throw 'player is unexpectedly undefined'
		}
		this.player.attachToCamera(this.cameras.main)
	}

	private addBackgroundImage(mapWidth: number, mapHeight: number) {
		const backgroundImage = this.add
			.image(0, 0, GLOBAL_ASSET_KEYS.images.background)
			.setOrigin(0)
			.setDepth(-1)

		const mainCamera = this.cameras.main
		if (mainCamera === undefined) {
			throw 'camera is unexpectedly undefined'
		}
		mainCamera.setBounds(0, 0, mapWidth, mapHeight)
		mainCamera.on('followupdate', function (camera: Phaser.Cameras.Scene2D.BaseCamera) {
			const horizontal = camera.scrollX / mapWidth
			const vertical = camera.scrollY / mapHeight

			const horizontalBackgroundOffset = -(backgroundImage.width - camera.width) * horizontal
			const verticalBackgroundOffset = -(backgroundImage.height - camera.height) * vertical

			backgroundImage.setX(camera.scrollX + horizontalBackgroundOffset)
			backgroundImage.setY(camera.scrollY + verticalBackgroundOffset)
		})
	}

	private addPauseMenuCallbacks() {
		const keyboard = this.input.keyboard
		if (keyboard === null) {
			throw 'keyboard input plugin is null'
		}
		keyboard.on('keydown-ESC', () => {
			this.scene.launch('PauseMenu', {
				callingScene: this._id,
				userSettings: this.userSettings,
			})
			this.scene.pause()
		})
	}

	private addMovingPlatforms(
		mapMaster: MapMasterT,
		characters: List<GameCharacter>
	): List<MovingPlatform> {
		const platforms = List(mapMaster.globalLayers)
			.filter((layer) => layer.name.indexOf('moving') === 0)
			.map((layer) =>
				List(
					layer.objects.map((obj) => {
						return new PixelPoint(obj.x, obj.y)
					})
				)
			)
			.map(MovementPathPoint.constructCircularLinkedList)
			.map(
				(initialMovementPoint) =>
					new MovingPlatform(
						{
							type: Platform.std,
							scene: this,
						},
						initialMovementPoint
					)
			)

		platforms.forEach((platform) =>
			characters.forEach((character) => {
				this.physics.add.collider(platform.getCollider(), character.getCollider())
			})
		)

		return platforms
	}

	private createNPCs(mapMaster: MapMasterT): List<GameCharacter> {
		const npcLayers = mapMaster.globalLayers.filter((layer) =>
			layer.name
				.toLowerCase()
				.startsWith(TILED_CUSTOM_CONSTANTS.layers.npc.name.toLowerCase())
		)
		const npcs = npcLayers
			.map((layer) =>
				layer.objects.map(
					(obj) =>
						new EdgeToEdgeNPC(
							this,
							new PixelPoint(obj.x, obj.y),
							// todo unclean ts-ignore
							//@ts-ignore
							layer.properties === undefined
								? false
								: // todo unclean ts-ignore
								  //@ts-ignore
								  getLayerBoolProperty(layer, 'kill')
						)
				)
			)
			.flat()
		return List(npcs)
	}
}

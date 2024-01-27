import { Player } from '../components/characters/Player.ts'
import {
	DEBUG,
	GLOBAL_ASSET_KEYS,
	MEASURES,
	SCENE_ASSET_KEYS,
	TILED_CUSTOM_CONSTANTS,
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
import { ChunkContext } from '../components/chunks/ChunkContext.ts'
import { EdgeToEdgeNPC } from '../components/characters/EdgeToEdgeNPC.ts'
import { PixelPoint } from '../utils/points/PixelPoint.ts'
import { TaskUnlocker } from '../auth/TaskUnlocker.ts'
import { InternalGameError } from '../errors/InternalGameError.ts'
import { StdControls } from '../components/controls/StdControls.ts'
import { IdleControls } from '../components/controls/IdleControls.ts'
import { FancyClickButton } from '../components/buttons/FancyClickButton.ts'

export class Level extends Phaser.Scene {
	private player?: Player
	private npcs?: List<GameCharacter>
	private movingPlatforms?: List<MovingPlatform>
	private readonly _id: string
	private userSettings?: GameSettings
	private tiledMap?: TiledMap
	private chunkContext?: ChunkContext
	private taskUnlocker?: TaskUnlocker
	private fpsDisplay?: Phaser.GameObjects.Text

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
		} else {
			throw new InternalGameError('level requires game settings')
		}

		if (data.taskUnlocker !== undefined) {
			this.taskUnlocker = data.taskUnlocker as TaskUnlocker
		} else {
			throw new InternalGameError('level requires task unlocker')
		}
	}

	public create() {
		if (DEBUG) {
			this.fpsDisplay = this.add.text(64, 0, '0 FPS').setScrollFactor(0).setOrigin(0, 0)
		}
		if (this.taskUnlocker === undefined) {
			throw new InternalGameError('task unlocker undefined')
		}

		const musicplayer = new MusicPlayer(this, this.userSettings)
		musicplayer.loop('audio-background')

		const mapMaster = typecheck(
			this.cache.json.get(SCENE_ASSET_KEYS.maps.master(this._id)),
			MapMaster
		)

		const spawnCoordinates = this.extractSpawnCoordinates(mapMaster)

		const map = new TiledMap(mapMaster)
		this.tiledMap = map
		this.npcs = this.createNPCs(mapMaster, map)
		const player = new Player(
			this,
			map,
			new StdControls(this),
			//todo this belongs in Player
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
			taskUnlocker: this.taskUnlocker,
		}

		this.tiledMap.update(this.player.getPosition(), this.chunkContext).then(() => {
			this.player?.unfreeze()
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
				layer.name.toLowerCase().trim() ===
				TILED_CUSTOM_CONSTANTS.layers.spawn.name.toLowerCase()
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
		if (this.fpsDisplay !== undefined) {
			this.fpsDisplay.setText(Math.round(this.game.loop.actualFps) + ' FPS')
		}

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
			.filter((npc) => !this.tiledMap?.positionIsLoaded(npc.getPosition()))
			.forEach((npc) => npc.freeze())

		// unfreeze npcs that entered loaded area
		this.npcs
			?.filter((npc) => npc.isFrozen())
			.filter((npc) => this.tiledMap?.positionIsLoaded(npc.getPosition()))
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

		backgroundImage.setDisplaySize(
			Math.max(backgroundImage.width, MEASURES.window.width * 1.2),
			Math.max(backgroundImage.height, MEASURES.window.height * 1.2)
		)
		backgroundImage.setSize(
			Math.max(backgroundImage.width, MEASURES.window.width * 1.2),
			Math.max(backgroundImage.height, MEASURES.window.height * 1.2)
		)

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
		const startPauseMenu = () => {
			this.scene.launch('PauseMenu', {
				callingScene: this._id,
				userSettings: this.userSettings,
				taskUnlocker: this.taskUnlocker,
			})
			this.scene.pause()
		}

		const pauseButton = new FancyClickButton(this, {
			x: MEASURES.window.width - 10,
			y: MEASURES.window.height - 10,
			fixed: true,
			label: 'Pause',
			clickCallback: startPauseMenu,
			idleFillColor: 0x00ff00,
			hoverFillColor: 0xff0000,
		})
		pauseButton.x -= pauseButton.width
		pauseButton.y -= pauseButton.height
		pauseButton.display()

		const keyboard = this.input.keyboard
		if (keyboard === null) {
			throw 'keyboard input plugin is null'
		}
		keyboard.on('keydown-ESC', startPauseMenu)
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

	private createNPCs(mapMaster: MapMasterT, map: TiledMap): List<GameCharacter> {
		const npcLayers = mapMaster.globalLayers.filter((layer) =>
			layer.name
				.toLowerCase()
				.trim()
				.startsWith(TILED_CUSTOM_CONSTANTS.layers.npc.name.toLowerCase())
		)
		const npcs = npcLayers
			.map((layer) =>
				layer.objects.map(
					(obj) =>
						new EdgeToEdgeNPC(
							this,
							map,
							new IdleControls(),
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

		npcs.forEach((npc) => npc.freeze())
		return List(npcs)
	}
}

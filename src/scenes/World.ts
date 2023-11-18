import Player from '../components/Player.ts'
import { GLOBAL_ASSET_KEYS, MEASURES, SCENE_ASSET_KEYS, filePaths } from '../constants.ts'
import MusicPlayer from '../components/MusicPlayer.ts'
import GameSettings from '../components/UserSettings.ts'
import { typecheck } from '../utils.ts'
import ChunkLoader from '../components/ChunkLoader.ts'
import { MapMaster, MapMasterT } from '../tiled-types.ts'

export default class World extends Phaser.Scene {
	private player?: Player
	private readonly worldId: number
	private userSettings?: GameSettings
	private chunkLoader?: ChunkLoader

	public static buildSceneKey(id: number): string {
		return `World${id}`
	}

	public constructor(worldId: number) {
		super({
			key: World.buildSceneKey(worldId),
		})

		this.worldId = worldId
	}

	public init(data: Record<string, unknown>) {
		if (data.userSettings instanceof GameSettings) {
			this.userSettings = data.userSettings
		}
	}

	public preload() {
		this.load.image(SCENE_ASSET_KEYS.maps.tileset(this.getSceneKey()), filePaths.sprites.sheet)
		this.load.image(GLOBAL_ASSET_KEYS.images.background, filePaths.images.background)
		this.load.json(
			SCENE_ASSET_KEYS.maps.master(this.getSceneKey()),
			filePaths.maps.master(this.getSceneKey())
		)
	}

	public create() {
		const mapMaster = typecheck(
			this.cache.json.get(SCENE_ASSET_KEYS.maps.master(this.getSceneKey())),
			MapMaster
		)

		const spawnCoordinates = this.extractSpawnCoordinates(mapMaster)

		this.chunkLoader = new ChunkLoader(-1, mapMaster)
		this.player = new Player(this, spawnCoordinates)
		this.player.freeze()
		this.chunkLoader
			.update(this.player.getX(), this.player.getY(), {
				player: this.player,
				scene: this,
				worldSceneKey: this.getSceneKey(),
			})
			.then(() => this.player?.unfreeze())

		const musicplayer = new MusicPlayer(this, this.userSettings)
		musicplayer.loop('audio-background')

		this.setupCamera()
		this.addBackgroundImage()
		this.addPauseMenuCallbacks()

		this.events.on('shutdown', () => {
			this.player?.shutdown()
			musicplayer?.shutdown()
		})
	}

	private extractSpawnCoordinates(mapMaster: MapMasterT): { x: number; y: number } {
		const defaultSpawn = MEASURES.player.spawn.default
		const spawnLayer = mapMaster.globalLayers.find((layer) => layer.name === 'Spawn')

		if (spawnLayer === undefined) {
			return { x: defaultSpawn.x, y: defaultSpawn.y }
		} else {
			const spawnObj = spawnLayer.objects[0]
			if (spawnObj === undefined) {
				return { x: defaultSpawn.x, y: defaultSpawn.y }
			} else {
				return { x: spawnObj.x, y: spawnObj.y }
			}
		}
	}

	public update() {
		if (this.player === undefined) {
			throw 'player is unexpectedly undefined'
		}
		this.player.update(this)

		if (this.chunkLoader === undefined) {
			throw 'chunk loader is unexpectedly undefined'
		}
		this.chunkLoader.update(this.player.getX(), this.player.getY(), {
			player: this.player,
			scene: this,
			worldSceneKey: this.getSceneKey(),
		})
	}

	public getSceneKey(): string {
		return World.buildSceneKey(this.worldId)
	}

	private setupCamera() {
		if (this.player === undefined) {
			throw 'player is unexpectedly undefined'
		}
		this.player.attachToCamera(this.cameras.main)
	}

	private addBackgroundImage() {
		const backgroundImage = this.add
			.image(0, 0, GLOBAL_ASSET_KEYS.images.background)
			.setOrigin(0, 0)
			.setDepth(-1)

		if (this.cameras.main === undefined) {
			throw 'camera is unexpectedly undefined'
		}
		this.cameras.main.on('followupdate', function (camera: Phaser.Cameras.Scene2D.BaseCamera) {
			backgroundImage.x = camera.scrollX
			backgroundImage.y = camera.scrollY
		})
	}

	private addPauseMenuCallbacks() {
		const keyboard = this.input.keyboard
		if (keyboard === null) {
			throw 'keyboard input plugin is null'
		}
		keyboard.on('keydown-ESC', () => {
			this.scene.launch('PauseMenu', {
				callingScene: this.getSceneKey(),
				userSettings: this.userSettings,
			})
			this.scene.pause()
		})
	}
}

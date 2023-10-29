import Player from '../components/Player.ts'
import { List } from "immutable"
import { filePaths } from '../constants.ts'
import MusicPlayer from '../components/MusicPlayer.ts'
import GameSettings from '../components/UserSettings.ts'
import { layerGetBoolProperty } from '../utils.ts'

export default class World extends Phaser.Scene {
	private player?: Player
	private camera?: Phaser.Cameras.Scene2D.Camera
	private musicplayer?: MusicPlayer
	private readonly worldId: number
	private userSettings?: GameSettings

	public static buildSceneKey (id: number): string {
		return `World${id}`
	}

	public constructor(worldId: number) {
		super({
			key: World.buildSceneKey(worldId),
		})

		this.worldId = worldId
	}

	public init (data: Record<string, unknown>) {
		if (data.userSettings instanceof GameSettings) {
			this.userSettings = data.userSettings
		}
	}

	public preload() {
		this.load.image(`${this.getSceneKey()}-tiles`, filePaths.sprites.sheet)
		this.load.image(`${this.getSceneKey()}-backgroundImageKey`, filePaths.images.background)
		this.load.tilemapTiledJSON(`${this.getSceneKey()}-map`, filePaths.maps.tilemap(this.worldId))
		this.load.json(`${this.getSceneKey()}-mapjson`, filePaths.maps.tilemap(this.worldId))
	}

	public create() {
		const map = this.make.tilemap({ key: `${this.getSceneKey()}-map` })
		const tileset = map.addTilesetImage('spritesheet', `${this.getSceneKey()}-tiles`)
		if (tileset === null) {
			throw 'failed to create tileset object'
		}

		this.player = this.createPlayer(map)
		this.musicplayer = new MusicPlayer(this, this.userSettings)
		this.musicplayer.loop('audio-background')

		this.setupCamera(map)
		this.addLayers(map, tileset)
		this.addBackgroundImage()
		this.addPauseMenuCallbacks()

		this.events.on('shutdown', () => {
			this.player?.shutdown()
			this.musicplayer?.shutdown()
		})
	}

	public update() {
		if (this.player === undefined) {
			throw 'player is unexpectedly undefined'
		}
		this.player.update(this)
	}

	public getSceneKey (): string {
		return World.buildSceneKey(this.worldId)
	}

	private createPlayer(map: Phaser.Tilemaps.Tilemap): Player {
		const spawnPoint = map.findObject('Spawn', () => true)

		if (spawnPoint === null || spawnPoint.x === undefined || spawnPoint.y === undefined) {
			return new Player(this, this.getSceneKey())
		} else {
			return new Player(this, this.getSceneKey(), { x: spawnPoint.x, y: spawnPoint.y })
		}
	}

	private setupCamera(map: Phaser.Tilemaps.Tilemap) {
		this.camera = this.cameras.main
		this.camera.setBounds(0, 0, map.widthInPixels, map.heightInPixels)
		if (this.player === undefined) {
			throw 'player is unexpectedly undefined'
		}
		this.player.attachToCamera(this.camera)
	}

	private addLayers(map: Phaser.Tilemaps.Tilemap, tileset: Phaser.Tilemaps.Tileset) {
		const mapJSON = this.cache.json.get(`${this.getSceneKey()}-mapjson`)
		const tileLayerNames = List(mapJSON.layers)
			.filter((layer: any) => layer.type === 'tilelayer')
			.map(function (layer: any) {
				return String(layer.name)
			})

		for (const layerName of tileLayerNames) {
			const layer = map.createLayer(layerName, [tileset])
			if (layer === null) {
				throw "map couldn't create layer " + layerName
			}

			if (layerGetBoolProperty(layer, 'collide')) {
				layer.setCollisionByExclusion([-1])
				if (this.player === undefined) {
					throw 'player is unexpectedly undefined'
				}
				this.physics.add.collider(this.player.getCollider(), layer)
			}
		}
	}

	private addBackgroundImage() {
		const backgroundImage = this.add.image(0, 0, `${this.getSceneKey()}-backgroundImageKey`).setOrigin(0, 0).setDepth(-1)

		if (this.camera === undefined) {
			throw 'camera is unexpectedly undefined'
		}
		this.camera.on('followupdate', function (camera: Phaser.Cameras.Scene2D.BaseCamera) {
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
				userSettings: this.userSettings
			})
			this.scene.pause()
		})
	}
}

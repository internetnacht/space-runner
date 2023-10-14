import Phaser from 'phaser'
import Player from '../components/Player.ts'
import { List } from "immutable"
import { filePaths } from '../constants.ts'
import MusicPlayer from '../components/MusicPlayer.ts'
import UserSettings from '../components/UserSettings.ts'

export default class World extends Phaser.Scene {
	private player?: Player
	private camera?: Phaser.Cameras.Scene2D.Camera
	private musicplayer?: MusicPlayer
	public readonly mapKey: string
	public readonly sceneKey: string
	private userSettings?: UserSettings

	public constructor(sceneKey: string, mapKey: string) {
		super({
			key: sceneKey,
		})

		this.sceneKey = sceneKey
		this.mapKey = mapKey
	}

	public init (data: any) {
		if (data.userSettings !== undefined) {
			this.userSettings = data.userSettings
		}
	}

	public preload() {
		this.load.image(`${this.sceneKey}-tiles`, filePaths.sprites.sheet)
		this.load.image(`${this.sceneKey}-backgroundImageKey`, filePaths.images.background)
		this.load.tilemapTiledJSON(`${this.sceneKey}-map`, filePaths.maps.tilemap(this.mapKey))
		this.load.json(`${this.sceneKey}-mapjson`, filePaths.maps.tilemap(this.mapKey))
	}

	public create() {
		const map = this.make.tilemap({ key: `${this.sceneKey}-map` })
		const tileset = map.addTilesetImage('spritesheet', `${this.sceneKey}-tiles`)
		if (tileset === null) {
			throw 'failed to create tileset object'
		}

		this.player = this.createPlayer(map)
		this.musicplayer = new MusicPlayer(this)
		this.musicplayer.play('audio-background')

		this.setupCamera(map)
		this.addLayers(map, tileset)
		this.addBackgroundImage()
		this.addPauseMenuCallbacks()

		this.events.on('shutdown', () => {
			this.player?.shutdown()
			this.musicplayer?.shutdown()
		})
	}

	private createPlayer(map: Phaser.Tilemaps.Tilemap): Player {
		const spawnPoint = map.findObject('Spawn', () => true)

		if (spawnPoint === null || spawnPoint.x === undefined || spawnPoint.y === undefined) {
			return new Player(this, this.sceneKey)
		} else {
			return new Player(this, this.sceneKey, { x: spawnPoint.x, y: spawnPoint.y })
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
		const mapJSON = this.cache.json.get(`${this.sceneKey}-mapjson`)
		const layerNames = List(mapJSON.layers)
			.filter((layer: any) => layer.type === 'tilelayer')
			.map(function (layer: any) {
				return String(layer.name)
			})

		for (const layerName of layerNames) {
			const layer = map.createLayer(layerName, [tileset])
			if (layer === null) {
				throw "map couldn't create layer " + layerName
			}

			if (this.layerGetBoolProperty(layer, 'collide')) {
				layer.setCollisionByExclusion([-1])
				if (this.player === undefined) {
					throw 'player is unexpectedly undefined'
				}
				this.player.setCollideWithLayer(layer)
			}
		}
	}

	private layerGetBoolProperty(layer: Phaser.Tilemaps.TilemapLayer, propName: string) {
		const properties = layer.layer.properties
		return (
			properties.findIndex(function (prop: any) {
				return prop.name === propName && prop.value === true
			}) !== -1
		)
	}

	private addBackgroundImage() {
		const backgroundImage = this.add.image(0, 0, `${this.sceneKey}-backgroundImageKey`).setOrigin(0, 0).setDepth(-1)

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
				callingScene: this.sceneKey,
				userSettings: this.userSettings
			})
			this.scene.pause()
		})
	}

	public update() {
		if (this.player === undefined) {
			throw 'player is unexpectedly undefined'
		}
		this.player.update()
	}
}

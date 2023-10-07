import Phaser from 'phaser'
import Player from "../components/Player.ts";

export default class World extends Phaser.Scene {
    // @ts-ignore
    private player: Player
    public readonly mapKey: string
    public readonly sceneKey: string

    public constructor (sceneKey: string, mapKey: string) {
        super({
            key: sceneKey
        });

        this.sceneKey = sceneKey
        this.mapKey = mapKey
    }

    public preload () {
        this.load.image(`${this.sceneKey}-tiles`, 'sprites/spritesheet.png')
        this.load.image(`${this.sceneKey}-backgroundImageKey`, 'images/background.png')
        this.load.tilemapTiledJSON(`${this.sceneKey}-map`, `tilemaps/${this.mapKey}.json`)
        this.load.json(`${this.sceneKey}-mapjson`, `tilemaps/${this.mapKey}.json`)
    }

    public create () {
        const map = this.make.tilemap({key: `${this.sceneKey}-map`})
        const tileset = map.addTilesetImage('spritesheet',`${this.sceneKey}-tiles`)
        if (tileset === null) {
            throw 'failed to create tileset object'
        }

        const spawnPoint = map.findObject("Spawn", () => true);

        if (spawnPoint === null || spawnPoint.x === undefined || spawnPoint.y === undefined) {
            this.player = new Player(this)
        } else {
            this.player = new Player(this, {x: spawnPoint.x, y: spawnPoint.y})
        }

        const camera = this.cameras.main
        camera.setBounds(0,0, map.widthInPixels, map.heightInPixels)
        this.player.attachToCamera(camera)
        this.addLayers(map, tileset)

        const backgroundImage = this.add.image(0, 0, `${this.sceneKey}-backgroundImageKey`)
        backgroundImage.setOrigin(0,0)
        backgroundImage.setDepth(-1);

        camera.on('followupdate', function (camera: Phaser.Cameras.Scene2D.BaseCamera) {
            backgroundImage.x = camera.scrollX;
            backgroundImage.y = camera.scrollY;
        });

        const keyboard = this.input.keyboard
        if (keyboard === null) {
            throw 'keyboard input plugin is null'
        }
        keyboard.on('keydown-ESC', () => {
            this.scene.launch("PauseMenu", {callingScene: this.sceneKey});
            this.scene.pause();
        });
    }

    private addLayers (map: Phaser.Tilemaps.Tilemap, tileset: Phaser.Tilemaps.Tileset) {
        const mapJSON = this.cache.json.get(`${this.sceneKey}-mapjson`)
        const layerNames: string[] = mapJSON.layers
            .filter((layer: any) => layer.type === 'tilelayer')    
            .map(function (layer: any) {
                return layer.name
            })

        for (const layerName of layerNames) {
            const layer = map.createLayer(layerName, [tileset])
            if (layer === null) {
                throw 'map couldn\'t create layer ' + layerName
            }

            if (this.layerGetBoolProperty(layer, 'collide')) {
                layer.setCollisionByExclusion([-1])
                this.player.setCollideWithLayer(layer)
            }
        }
    }

    private layerGetBoolProperty (layer: Phaser.Tilemaps.TilemapLayer, propName: string) {
        const properties = layer.layer.properties;
        return properties.findIndex(function (prop: any) {
            return prop.name === propName && prop.value === true;
        }) !== -1;
    }

    public update () {
        this.player.update()
    }
}
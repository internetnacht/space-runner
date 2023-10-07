import Phaser from 'phaser';
import Player from "../../components/Player.ts";

class World1 extends Phaser.Scene {
    // @ts-ignore
    private player: Player

    constructor() {
        super({
            key: 'Map'
        });
    }

    preload () {
        this.load.image('tiles', 'assets/sprites/spritesheet.png')
        this.load.tilemapTiledJSON('map', 'assets/tilemaps/map2.json')
        this.load.json('mapjson', 'assets/tilemaps/map2.json')
    }

    create () {
        const map = this.make.tilemap({key: 'map'})
        const tileset = map.addTilesetImage('spritesheet','tiles')
        if (tileset === null) {
            throw 'failed to create tileset object'
        }

        this.player = new Player(this)
        const camera = this.cameras.main
        camera.setBounds(0,0, map.widthInPixels, map.heightInPixels)
        this.player.attachToCamera(camera)
        this.addLayers(map, tileset)
    }

    private addLayers (map: Phaser.Tilemaps.Tilemap, tileset: Phaser.Tilemaps.Tileset) {
        const mapJSON = this.cache.json.get('mapjson')
        const layerNames: string[] = mapJSON.layers.map(function (layer: any) {
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

    update () {
        this.player.update()
    }
}

export default World1;
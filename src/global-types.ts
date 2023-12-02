import Player from './components/characters/Player'
import { PHASER_FILE_TYPES } from './constants'
import { ObjectMapLayerT } from './tiled-types'

export type ChunkId = number

export interface Asset {
	key: string
	type: PHASER_FILE_TYPES
	filePath: string
}

export interface ChunkContext {
	readonly scene: Phaser.Scene
	readonly player: Player
	readonly worldSceneKey: string
	readonly globalLayers: ObjectMapLayerT[]
}

export type CollisionCause = Phaser.Tilemaps.Tile | Phaser.Types.Physics.Arcade.GameObjectWithBody

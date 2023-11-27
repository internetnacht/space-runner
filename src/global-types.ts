import Player from './components/Player'
import { PHASER_FILE_TYPES } from './constants'

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
}

export interface Point {
	readonly x: number
	readonly y: number
}

export type CollisionCause = Phaser.Tilemaps.Tile | Phaser.Types.Physics.Arcade.GameObjectWithBody

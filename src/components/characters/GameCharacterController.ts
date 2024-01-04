import { TiledMap } from '../chunks/TiledMap'

export interface GameCharacterController {
	act(scene: Phaser.Scene, map?: TiledMap): void
	movesDown(): boolean
}

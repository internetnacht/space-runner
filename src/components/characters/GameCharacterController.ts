import { Controls } from '../controls/Controls'
import { TiledMap } from '../chunks/TiledMap'

export interface GameCharacterController {
	act(scene: Phaser.Scene, controls: Controls, map?: TiledMap): void
	movesDown(): boolean
}

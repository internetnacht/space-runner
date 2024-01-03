import { Chunk } from '../chunks/Chunk'

export interface GameCharacterController {
	act(scene: Phaser.Scene, map?: Chunk): void
	movesDown(): boolean
}

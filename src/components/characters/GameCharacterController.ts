export interface GameCharacterController {
	act(scene: Phaser.Scene): void
	movesDown(): boolean
}

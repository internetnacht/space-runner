import { InternalGameError } from '../../errors/InternalGameError'
import { Controls } from './Controls'

export class KeyControls implements Controls {
	private readonly keys: Phaser.Types.Input.Keyboard.CursorKeys

	public constructor(scene: Phaser.Scene) {
		const keyboard = scene.input.keyboard
		if (keyboard === null) {
			throw new InternalGameError('keyboard plugin isnt supported')
		}
		this.keys = keyboard.createCursorKeys()
	}

	rightDown(): boolean {
		return this.keys.right.isDown
	}
	leftDown(): boolean {
		return this.keys.left.isDown
	}
	upDown(): boolean {
		return this.keys.up.isDown
	}
	bottomDown(): boolean {
		return this.keys.down.isDown
	}
}

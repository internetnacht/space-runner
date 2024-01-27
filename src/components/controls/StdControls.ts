import { Controls } from './Controls'
import { KeyControls } from './KeyControls'

export class StdControls implements Controls {
	private readonly keys: KeyControls

	public constructor(scene: Phaser.Scene) {
		this.keys = new KeyControls(scene)
	}

	rightDown(): boolean {
		return this.keys.rightDown()
	}
	leftDown(): boolean {
		return this.keys.leftDown()
	}
	upDown(): boolean {
		return this.keys.upDown()
	}
	bottomDown(): boolean {
		return this.keys.bottomDown()
	}
}

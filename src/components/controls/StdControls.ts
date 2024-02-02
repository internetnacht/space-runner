import { Controls } from './Controls'
import { KeyControls } from './KeyControls'
import { TouchControls } from './TouchControls'

export class StdControls implements Controls {
	private readonly keys: KeyControls
	private readonly touch: TouchControls

	public constructor(scene: Phaser.Scene) {
		this.keys = new KeyControls(scene)
		this.touch = new TouchControls(scene)
	}

	rightDown(): boolean {
		return this.keys.rightDown() || this.touch.rightDown()
	}
	leftDown(): boolean {
		return this.keys.leftDown() || this.touch.leftDown()
	}
	upDown(): boolean {
		return this.keys.upDown() || this.touch.upDown()
	}
	bottomDown(): boolean {
		return this.keys.bottomDown() || this.touch.bottomDown()
	}
}

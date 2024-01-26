import { Controls } from './Controls'

export class IdleControls implements Controls {
	rightDown(): boolean {
		return false
	}
	leftDown(): boolean {
		return false
	}
	upDown(): boolean {
		return false
	}
	bottomDown(): boolean {
		return false
	}
}

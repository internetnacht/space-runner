import { TaskUnlocker } from './TaskUnlocker'

export class DummyTaskUnlocker implements TaskUnlocker {
	async unlock(_: string): Promise<boolean> {
		return false
	}
	async isUnlocked(_: string): Promise<boolean> {
		return false
	}
}

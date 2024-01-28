import { TaskUnlocker } from './TaskUnlocker'

export class DummyTaskUnlocker implements TaskUnlocker {
	async unlock(_: string): Promise<void> {
		return
	}
	async isUnlocked(_: string): Promise<boolean> {
		return false
	}
}

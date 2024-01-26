import { TaskUnlocker } from '../auth/TaskUnlocker'

export class GameSettings {
	private listeners: ((settings: Readonly<GameSettings>) => void)[]
	private _musicIsOn: boolean
	private _taskUnlocker: TaskUnlocker | null

	public static default(): GameSettings {
		return new GameSettings()
	}

	public constructor() {
		this.listeners = []
		this._musicIsOn = true
		this._taskUnlocker = null
	}

	public emitUpdate(): void {
		this.listeners.forEach((cb) => cb(this))
	}

	public listen(cb: (settings: Readonly<GameSettings>) => void): void {
		this.listeners.push(cb)
	}

	public get musicIsOn(): boolean {
		return this._musicIsOn
	}

	public set musicIsOn(v: boolean) {
		this._musicIsOn = v
		this.emitUpdate()
	}

	public set taskUnlocker(unlocker: TaskUnlocker) {
		this._taskUnlocker = unlocker
	}

	public get taskUnlocker(): TaskUnlocker | null {
		return this._taskUnlocker
	}

	/**
	 * todo somehow manage the visibility memory management problem in a clean way
	 */
	public clone(): GameSettings {
		this.listeners = []
		return this
	}
}

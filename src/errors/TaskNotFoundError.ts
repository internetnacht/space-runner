export class TaskNotFoundError extends Error {
	public constructor(msg: string) {
		super(msg)
	}
}
